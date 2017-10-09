import { PermissionsApi, ApiErrors } from '../api';
import { SagaIterator, effects } from 'redux-saga';
import {
  AddPermission, ExpandedPermissionNodes, PermissionParameters, RefreshPermissionModerationLog, RefreshPermissions,
  RemovePermission,
} from '../actions';
import { PermissionsMap } from '../models/PermissionsMap';
import { Action } from 'redux-actions';
import { createSelector } from 'reselect';
import { ApplicationState } from '../state/ApplicationState';
import { contains } from 'ramda';
import { AddPermissionDialogState, RemovePermissionDialogState } from '../state/PermissionsState';
import { getAccessToken } from '../state/Selectors';
import { AppToaster } from '../AppToaster';
import { Intent } from '@blueprintjs/core';

function* fetchPermissionsSaga(): SagaIterator {
  try {
    yield effects.put(RefreshPermissions.started());

    const result: PermissionsMap = yield effects.call(PermissionsApi.fetchPermissions);

    yield effects.put(RefreshPermissions.success({ result }));
  } catch (error) {
    console.log(error, 'error fetching permissions');
    yield effects.put(RefreshPermissions.failure({ error }));
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
    yield effects.put(RefreshPermissions.start());
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
    yield effects.put(RefreshPermissions.start());
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

const getExpanded = createSelector<ApplicationState, string[], string[]>(
  state => state.permissions.expandedNodes,
  it => it,
);

function* togglePermissionNode(action: Action<string>): SagaIterator {
  const id: string = action.payload!;

  const expanded: string[] = yield effects.select(getExpanded);

  if (contains(id, expanded)) {
    yield effects.put(ExpandedPermissionNodes.close(id));
  } else {
    yield effects.put(ExpandedPermissionNodes.open(id));
  }
}

export function* watchPermissions(): SagaIterator {
  yield effects.all([
    effects.takeEvery<Action<string>>(AddPermission.start, addPermission),
    effects.takeEvery<Action<void>>(RemovePermission.start, removePermission),
    effects.takeLatest<Action<void>>(RefreshPermissions.start, fetchPermissionsSaga),
    effects.takeEvery<Action<string>>(ExpandedPermissionNodes.toggle, togglePermissionNode),
  ]);
}
