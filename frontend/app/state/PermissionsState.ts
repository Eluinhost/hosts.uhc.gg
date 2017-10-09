import { PermissionsMap } from '../models/PermissionsMap';
import { ReducerBuilder } from './ReducerBuilder';
import { contains, without } from 'ramda';
import { getAccessToken } from './Selectors';
import { Intent } from '@blueprintjs/core';
import {
  RefreshPermissionModerationLog, RefreshPermissions, ExpandedPermissionNodes, AddPermission, RemovePermission,
} from '../actions';

export type AddPermissionDialogState = {
  readonly permission: string;
};

export type RemovePermissionDialogState = {
  readonly permission: string;
  readonly username: string;
};

export type PermissionsState = {
  readonly fetching: boolean;
  readonly error: string | null;
  readonly expandedNodes: string[];
  readonly permissions: PermissionsMap;
  readonly addDialog: AddPermissionDialogState | null;
  readonly removeDialog: RemovePermissionDialogState | null;
};

export const reducer = new ReducerBuilder<PermissionsState>()
  .handle(RefreshPermissions.started, (prev, action) => ({
    ...prev,
    fetching: true,
    error: null,
  }))
  .handle(RefreshPermissions.success, (prev, action) => ({
    ...prev,
    fetching: false,
    permissions: action.payload!.result,
    error: null,
  }))
  .handle(RefreshPermissions.failure, (prev, action) => ({
    ...prev,
    fetching: false,
    error: 'Unable to refresh from the server',
  }))
  .handle(ExpandedPermissionNodes.open, (prev, action) => ({
    ...prev,
    expandedNodes: [...prev.expandedNodes, action.payload!],
  }))
  .handle(ExpandedPermissionNodes.close, (prev, action) => ({
    ...prev,
    expandedNodes: without([action.payload!], prev.expandedNodes),
  }))
  .handle(AddPermission.openDialog, (prev, action) => ({
    ...prev,
    addDialog: {
      permission: action.payload!,
    },
  }))
  .handle(RemovePermission.openDialog, (prev, action) => ({
    ...prev,
    removeDialog: {
      permission: action.payload!.permission,
      username: action.payload!.username,
    },
  }))
  .handle(AddPermission.closeDialog, (prev, action) => ({
    ...prev,
    addDialog: null,
  }))
  .handle(RemovePermission.closeDialog, (prev, action) => ({
    ...prev,
    removeDialog: null,
  }))
  .build();

export const initialValues = async (): Promise<PermissionsState> => ({
  fetching: false,
  error: null,
  permissions: {},
  expandedNodes: ['permission-admin'],
  removeDialog: null,
  addDialog: null,
});
