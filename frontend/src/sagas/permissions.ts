import { PermissionsApi, ApiErrors } from '../api';
import { SagaIterator } from 'redux-saga';
import { put, call, all, select, takeEvery, takeLatest } from 'redux-saga/effects';
import {
  AddPermission,
  FetchUserCountPerPermission,
  FetchUsersInPermission,
  FetchUsersInPermissionWithLetter,
  FetchUsersInPermissionWithLetterParameters,
  PermissionLetterNode,
  PermissionNode,
  PermissionParameters,
  RefreshPermissionModerationLog,
  RemovePermission,
} from '../actions';
import { createSelector } from 'reselect';
import { ApplicationState } from '../state/ApplicationState';
import { AddPermissionDialogState, RemovePermissionDialogState } from '../state/PermissionsState';
import { getAccessToken } from '../state/Selectors';
import { AppToaster } from '../services/AppToaster';
import { Intent } from '@blueprintjs/core';
import { UserCountPerPermission, UsersInPermission } from '../models/Permissions';

function* fetchPermissionsSaga(): SagaIterator {
  try {
    yield put(FetchUserCountPerPermission.started());

    const result: UserCountPerPermission = yield call(PermissionsApi.fetchUserCountPerPermission);

    yield put(FetchUserCountPerPermission.success({ result }));
  } catch (error) {
    console.error(error, 'error fetching permissions');
    yield put(FetchUserCountPerPermission.failure({ error }));
    AppToaster.show({
      intent: Intent.DANGER,
      message: `Failed to lookup permission list`,
    });
  }
}

function* fetchUsersInPermissionSaga(
  action: ReturnType<typeof FetchUsersInPermission.start> | ReturnType<typeof PermissionNode.open>,
): SagaIterator {
  const parameters: string = action.payload;

  try {
    yield put(FetchUsersInPermission.started({ parameters }));

    const result: UsersInPermission = yield call(PermissionsApi.fetchUsersInPermission, parameters);

    yield put(FetchUsersInPermission.success({ parameters, result }));
  } catch (error) {
    console.error(error, 'error fetching permission content');
    yield put(FetchUsersInPermission.failure({ parameters, error }));
    AppToaster.show({
      intent: Intent.DANGER,
      message: `Failed to lookup permission members`,
    });
  }
}

function* fetchUsersInPermissionWithLetterSaga(
  a: ReturnType<typeof FetchUsersInPermissionWithLetter.start> | ReturnType<typeof PermissionLetterNode.open>,
): SagaIterator {
  const parameters: FetchUsersInPermissionWithLetterParameters = a.payload;

  try {
    yield put(FetchUsersInPermissionWithLetter.started({ parameters }));

    const result: string[] = yield call(
      PermissionsApi.fetchUsersInPermissionWithLetter,
      parameters.permission,
      parameters.letter,
    );

    yield put(FetchUsersInPermissionWithLetter.success({ parameters, result }));
  } catch (error) {
    console.error(error, 'error fetching permission with letter content');
    yield put(FetchUsersInPermissionWithLetter.failure({ parameters, error }));
    AppToaster.show({
      intent: Intent.DANGER,
      message: `Failed to lookup permission members`,
    });
  }
}

const getAddPermission = createSelector<ApplicationState, AddPermissionDialogState | null, string | null>(
  state => state.permissions.addDialog,
  dialogState => (dialogState ? dialogState.permission : null),
);

function* addPermission(action: ReturnType<typeof AddPermission.start>): SagaIterator {
  const username: string = action.payload;

  const permission: string | null = yield select(getAddPermission);
  const accessToken: string | null = yield select(getAccessToken);

  const parameters: PermissionParameters = {
    username,
    permission: permission || 'NO PERMISSION FOUND',
  };

  try {
    if (!permission) throw new Error('invalid state');

    if (!accessToken) throw new ApiErrors.NotAuthenticatedError();

    yield put(AddPermission.started({ parameters }));
    yield call(PermissionsApi.callAddPermission, permission, username, accessToken);
    yield put(AddPermission.success({ parameters }));
    yield put(AddPermission.closeDialog());
    yield put(FetchUserCountPerPermission.start());
    yield put(RefreshPermissionModerationLog.start());

    AppToaster.show({
      intent: Intent.SUCCESS,
      message: `Added permission '${permission}' to /u/${username}`,
    });
  } catch (error) {
    console.error(error, 'Failed to add permission');

    yield put(AddPermission.failure({ parameters, error }));
    yield put(AddPermission.closeDialog());

    AppToaster.show({
      intent: Intent.DANGER,
      icon: 'warning-sign',
      message:
        error instanceof ApiErrors.BadDataError
          ? error.message
          : `Failed to add permission to /u/${parameters!.username}`,
    });
  }
}

const getRemovePermissionState = createSelector<
  ApplicationState,
  RemovePermissionDialogState | null,
  RemovePermissionDialogState | null
>(
  state => state.permissions.removeDialog,
  dialogState => dialogState,
);

function* removePermission(): SagaIterator {
  const accessToken: string | null = yield select(getAccessToken);
  const parameters: RemovePermissionDialogState | null = yield select(getRemovePermissionState);

  try {
    if (!parameters) throw new Error('invalid state');

    if (!accessToken) throw new ApiErrors.NotAuthenticatedError();

    yield put(RemovePermission.started({ parameters }));
    yield call(PermissionsApi.callRemovePermission, parameters.permission, parameters.username, accessToken);
    yield put(RemovePermission.success({ parameters }));
    yield put(RemovePermission.closeDialog());
    yield put(FetchUserCountPerPermission.start());
    yield put(RefreshPermissionModerationLog.start());

    AppToaster.show({
      intent: Intent.SUCCESS,
      message: `Removed permission '${parameters.permission}' from /u/${parameters.username}`,
    });
  } catch (error) {
    console.error(error, 'Failed to remove permission');

    yield put(RemovePermission.failure({ error, parameters: parameters! }));
    yield put(RemovePermission.closeDialog());

    AppToaster.show({
      intent: Intent.DANGER,
      icon: 'warning-sign',
      message:
        error instanceof ApiErrors.BadDataError
          ? error.message
          : `Failed to remove permission from /u/${parameters!.username}`,
    });
  }
}

export function* watchPermissions(): SagaIterator {
  yield all([
    takeEvery(AddPermission.start, addPermission),
    takeEvery(RemovePermission.start, removePermission),
    takeLatest(FetchUserCountPerPermission.start, fetchPermissionsSaga),
    takeLatest(FetchUsersInPermission.start, fetchUsersInPermissionSaga),
    takeLatest(PermissionNode.open, fetchUsersInPermissionSaga), // fetch users when expanded
    takeLatest(FetchUsersInPermissionWithLetter.start, fetchUsersInPermissionWithLetterSaga),
    takeLatest(PermissionLetterNode.open, fetchUsersInPermissionWithLetterSaga),
  ]);
}
