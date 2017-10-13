import { PermissionsApi, ApiErrors } from '../api';
import { SagaIterator, effects, delay } from 'redux-saga';
import {
  AddPermission, ExpandPermissionLetterNodeParameters, FetchUserCountPerPermission, FetchUsersInPermission,
  FetchUsersInPermissionWithLetter,
  FetchUsersInPermissionWithLetterParameters, PermissionLetterNode, PermissionNode,
  PermissionParameters,
  RefreshPermissionModerationLog,
  RemovePermission,
} from '../actions';
import { Action } from 'redux-actions';
import { createSelector } from 'reselect';
import { ApplicationState } from '../state/ApplicationState';
import { AddPermissionDialogState, RemovePermissionDialogState } from '../state/PermissionsState';
import { getAccessToken } from '../state/Selectors';
import { AppToaster } from '../services/AppToaster';
import { Intent } from '@blueprintjs/core';
import { UserCountPerPermission, UsersInPermission } from '../models/Permissions';
import { fetchUsersInPermission } from '../api/Permissions';

function* fetchPermissionsSaga(): SagaIterator {
  try {
    yield effects.put(FetchUserCountPerPermission.started());

    const result: UserCountPerPermission = yield effects.call(PermissionsApi.fetchUserCountPerPermission);

    yield effects.put(FetchUserCountPerPermission.success({ result }));
  } catch (error) {
    console.error(error, 'error fetching permissions');
    yield effects.put(FetchUserCountPerPermission.failure({ error }));
    AppToaster.show({
      intent: Intent.DANGER,
      message: `Failed to lookup permission list`,
    });
  }
}

function* fetchUsersInPermissionSaga(action: Action<string>): SagaIterator {
  const parameters: string = action.payload!;

  try {
    yield effects.put(FetchUsersInPermission.started({ parameters }));

    const result: UsersInPermission = yield effects.call(PermissionsApi.fetchUsersInPermission, parameters);

    yield effects.put(FetchUsersInPermission.success({ parameters, result }));
  } catch (error) {
    console.error(error, 'error fetching permission content');
    yield effects.put(FetchUsersInPermission.failure({ parameters, error }));
    AppToaster.show({
      intent: Intent.DANGER,
      message: `Failed to lookup permission members`,
    });
  }
}

function* fetchUsersInPermissionWithLetterSaga(a: Action<FetchUsersInPermissionWithLetterParameters>): SagaIterator {
  const parameters: FetchUsersInPermissionWithLetterParameters = a.payload!;

  try {
    yield effects.put(FetchUsersInPermissionWithLetter.started({ parameters }));

    const result: string[] = yield effects.call(
      PermissionsApi.fetchUsersInPermissionWithLetter,
      parameters.permission,
      parameters.letter,
    );

    yield effects.put(FetchUsersInPermissionWithLetter.success({ parameters, result }));
  } catch (error) {
    console.error(error, 'error fetching permission with letter content');
    yield effects.put(FetchUsersInPermissionWithLetter.failure({ parameters, error }));
    AppToaster.show({
      intent: Intent.DANGER,
      message: `Failed to lookup permission members`,
    });
  }
}

const getAddPermission = createSelector<ApplicationState, AddPermissionDialogState | null, string | null>(
  state => state.permissions.addDialog,
  dialogState => dialogState ? dialogState.permission : null,
);

function* addPermission(action: Action<string>): SagaIterator {
  const username: string = action.payload!;

  const permission: string | null = yield effects.select(getAddPermission);
  const accessToken: string | null = yield effects.select(getAccessToken);

  const parameters: PermissionParameters = {
    username,
    permission: permission || 'NO PERMISSION FOUND',
  };

  try {
    if (!permission)
      throw new Error('invalid state');

    if (!accessToken)
      throw new ApiErrors.NotAuthenticatedError();

    yield effects.put(AddPermission.started({ parameters }));
    yield effects.call(PermissionsApi.callAddPermission, permission, username, accessToken);
    yield effects.put(AddPermission.success({ parameters }));
    yield effects.put(AddPermission.closeDialog());
    yield effects.put(FetchUserCountPerPermission.start());
    yield effects.put(RefreshPermissionModerationLog.start());

    AppToaster.show({
      intent: Intent.SUCCESS,
      message: `Added permission '${permission}' to /u/${username}`,
    });
  } catch (error) {
    console.error(error, 'Failed to add permission');

    yield effects.put(AddPermission.failure({ parameters, error }));
    yield effects.put(AddPermission.closeDialog());

    AppToaster.show({
      intent: Intent.DANGER,
      iconName: 'warning-sign',
      message: error instanceof ApiErrors.BadDataError
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
  const accessToken: string | null = yield effects.select(getAccessToken);
  const parameters: RemovePermissionDialogState | null = yield effects.select(getRemovePermissionState);

  try {
    if (!parameters)
      throw new Error('invalid state');

    if (!accessToken)
      throw new ApiErrors.NotAuthenticatedError();

    yield effects.put(RemovePermission.started({ parameters }));
    yield effects.call(PermissionsApi.callRemovePermission, parameters.permission, parameters.username, accessToken);
    yield effects.put(RemovePermission.success({ parameters }));
    yield effects.put(RemovePermission.closeDialog());
    yield effects.put(FetchUserCountPerPermission.start());
    yield effects.put(RefreshPermissionModerationLog.start());

    AppToaster.show({
      intent: Intent.SUCCESS,
      message: `Removed permission '${parameters.permission}' from /u/${parameters.username}`,
    });
  } catch (error) {
    console.error(error, 'Failed to remove permission');

    yield effects.put(RemovePermission.failure({ error, parameters: parameters! }));
    yield effects.put(RemovePermission.closeDialog());

    AppToaster.show({
      intent: Intent.DANGER,
      iconName: 'warning-sign',
      message: error instanceof ApiErrors.BadDataError
        ? error.message
        : `Failed to remove permission from /u/${parameters!.username}`,
    });
  }
}

export function* watchPermissions(): SagaIterator {
  yield effects.all([
    effects.takeEvery<Action<string>>(AddPermission.start, addPermission),
    effects.takeEvery<Action<void>>(RemovePermission.start, removePermission),
    effects.takeLatest<Action<void>>(FetchUserCountPerPermission.start, fetchPermissionsSaga),
    effects.takeLatest<Action<string>>(FetchUsersInPermission.start, fetchUsersInPermissionSaga),
    effects.takeLatest<Action<string>>(PermissionNode.open, fetchUsersInPermissionSaga), // fetch users when expanded
    effects.takeLatest<Action<FetchUsersInPermissionWithLetterParameters>>(
      FetchUsersInPermissionWithLetter.start, fetchUsersInPermissionWithLetterSaga,
    ),
    effects.takeLatest<Action<ExpandPermissionLetterNodeParameters>>(
      PermissionLetterNode.open, fetchUsersInPermissionWithLetterSaga,
    ),
  ]);
}
