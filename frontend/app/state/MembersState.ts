import { ThunkAction } from 'redux-thunk';
import { ApplicationState } from './ApplicationState';
import { Action, createAction } from 'redux-actions';
import { PermissionsMap } from '../PermissionsMap';
import {
  addPermission,
  fetchModLog,
  fetchPermissions,
  ForbiddenError,
  NotAuthenticatedError, removePermission,
  UnexpectedResponseError,
} from '../api/index';
import { ReducerBuilder } from './ReducerBuilder';
import { T, F, always, contains, concat, without } from 'ramda';
import { ModLogEntry } from '../ModLogEntry';

export type AddPermissionDialogState = {
  readonly permission: string;
  readonly isOpen: boolean;
};

export type RemovePermissionDialogState = {
  readonly isOpen: boolean;
  readonly permission: string;
  readonly username: string;
};

export type PermissionsState = {
  readonly fetching: boolean;
  readonly error: string | null;
  readonly expandedPermissions: string[];
  readonly permissions: PermissionsMap;
};

export type ModerationLogState = {
  readonly fetching: boolean;
  readonly error: string | null;
  readonly log: ModLogEntry[];
};

export type MembersState = {
  readonly permissions: PermissionsState;
  readonly moderationLog: ModerationLogState;
  readonly dialogs: {
    readonly add: AddPermissionDialogState;
    readonly remove: RemovePermissionDialogState;
  };
};

const startPermissionsFetch = createAction('PERMISSIONS_START_FETCH');
const endPermissionsFetch = createAction<PermissionsMap>('PERMISSIONS_END_FETCH');
const fetchPermissionsError = createAction<string>('PERMISSIONS_FETCH_ERROR');

const startPermisssionAdd = createAction('PERMISSION_ADD_START');
const permissionAddSuccess = createAction('PERMISSION_ADD_END');

const startPermisssionRemove = createAction('PERMISSION_REMOVE_START');
const permissionRemoveSuccess = createAction('PERMISSION_REMOVE_END');

const startModLogFetch = createAction('MOD_LOG_START_FETCH');
const endModLogFetch = createAction<ModLogEntry[]>('MOD_LOG_END_FETCH');
const fetchModLogError = createAction<string>('MOD_LOG_FETCH_ERROR');

const collapsePermssion = createAction<string>('COLLAPSE_PERMISSION');
const expandPermission = createAction<string>('EXPAND_PERMISSION');

export const MembersActions = {
  /**
   * Refetches permissions set
   */
  refetchPermissions: (): ThunkAction<Promise<void>, ApplicationState, {}> => async (dispatch): Promise<void> => {
    dispatch(startPermissionsFetch());

    try {
      const data = await fetchPermissions();

      dispatch(endPermissionsFetch(data));
    } catch (err) {
      if (err instanceof NotAuthenticatedError)
        dispatch(fetchPermissionsError('You are not logged in'));

      if (err instanceof ForbiddenError)
        dispatch(fetchPermissionsError('You do not have permissions to do this'));

      if (err instanceof UnexpectedResponseError)
        dispatch(fetchPermissionsError('Uexpected response from the server'));

      dispatch(fetchPermissionsError('Unable to fetch list from server'));

      throw err;
    }
  },
  refetchModerationLog: (): ThunkAction<Promise<void>, ApplicationState, {}> => async (dispatch): Promise<void> => {
    dispatch(startModLogFetch());

    try {
      const data = await fetchModLog();

      dispatch(endModLogFetch(data));
    } catch (err) {
      if (err instanceof NotAuthenticatedError)
        dispatch(fetchModLogError('You are not logged in'));

      if (err instanceof ForbiddenError)
        dispatch(fetchModLogError('You do not have permissions to do this'));

      if (err instanceof UnexpectedResponseError)
        dispatch(fetchModLogError('Uexpected response from the server'));

      dispatch(fetchModLogError('Unable to fetch list from server'));

      throw err;
    }
  },
  togglePermissionExpanded: (perm: string): ThunkAction<void, ApplicationState, {}> => (dispatch, getState): void => {
    dispatch(
      contains(perm, getState().members.permissions.expandedPermissions)
        ? collapsePermssion(perm)
        : expandPermission(perm),
    );
  },
  openAddPermissionDialog: createAction<string>('OPEN_ADD_PERMISSION_DIALOG'),
  closeAddPermissionDialog: createAction('CLOSE_ADD_PERMISSION_DIALOG'),
  openRemovePermissionDialog:
    createAction<{ username: string, permission: string }>('OPEN_REMOVE_PERMISSION_DIALOG'),
  closeRemovePermissionDialog: createAction('CLOSE_REMOVE_PERMISSION_DIALOG'),
  addPermission: (username: string): ThunkAction<Promise<void>, ApplicationState, {}> =>
    async (dispatch, getState): Promise<void> => {
      dispatch(startPermisssionAdd());
      
      const state = getState();

      await addPermission(state.members.dialogs.add.permission, username, state.authentication.data!.rawAccessToken);

      dispatch(permissionAddSuccess());
      dispatch(MembersActions.refetchModerationLog());
      dispatch(MembersActions.refetchPermissions());
    },
  removePermission: (): ThunkAction<Promise<void>, ApplicationState, {}> =>
    async (dispatch, getState): Promise<void> => {
      dispatch(startPermisssionRemove());

      const state = getState();

      await removePermission(
        state.members.dialogs.remove.permission, 
        state.members.dialogs.remove.username, 
        state.authentication.data!.rawAccessToken,
      );

      dispatch(permissionRemoveSuccess());
      dispatch(MembersActions.refetchModerationLog());
      dispatch(MembersActions.refetchPermissions());
    },
};

export const reducer = new ReducerBuilder<MembersState>()
  .handleEvolve(startPermissionsFetch, () => ({
    permissions: {
      fetching: T,
      error: always(null),
    },
  }))
  .handleEvolve(endPermissionsFetch, (action: Action<PermissionsMap>) => ({
    permissions: {
      fetching: F,
      permissions: always(action.payload),
      error: always(null),
    },
  }))
  .handleEvolve(fetchPermissionsError, (action: Action<string>) => ({
    permissions: {
      fetching: F,
      error: always(action.payload),
    },
  }))
  .handleEvolve(expandPermission, (action: Action<string>) => ({
    permissions: {
      expandedPermissions: concat([action.payload]),
    },
  }))
  .handleEvolve(collapsePermssion, (action: Action<string>) => ({
    permissions: {
      expandedPermissions: without([action.payload]),
    },
  }))
  .handleEvolve(startModLogFetch, () => ({
    moderationLog: {
      fetching: T,
      error: always(null),
    },
  }))
  .handleEvolve(endModLogFetch, (action: Action<ModLogEntry[]>) => ({
    moderationLog: {
      fetching: F,
      log: always(action.payload),
      error: always(null),
    },
  }))
  .handleEvolve(fetchModLogError, (action: Action<string>) => ({
    moderationLog: {
      fetching: F,
      error: always(action.payload),
    },
  }))
  .handleEvolve(MembersActions.openAddPermissionDialog, (action: Action<string>) => ({
    dialogs: {
      add: {
        isOpen: T,
        permission: always(action.payload),
      },
    },
  }))
  .handleEvolve(
    MembersActions.openRemovePermissionDialog,
    (action: Action<{ username: string, permission: string }>) => ({
      dialogs: {
        remove: {
          isOpen: T,
          permission: always(action.payload!.permission),
          username: always(action.payload!.username),
        },
      },
    }),
  )
  .handleEvolve(MembersActions.closeAddPermissionDialog, {
    dialogs: {
      add: {
        isOpen: F,
      },
    },
  })
  .handleEvolve(MembersActions.closeRemovePermissionDialog, {
    dialogs: {
      remove: {
        isOpen: F,
      },
    },
  })
  .build();

export const initialValues = async (): Promise<MembersState> => ({
  permissions: {
    fetching: false,
    error: null,
    permissions: {},
    expandedPermissions: [],
  },
  moderationLog: {
    error: null,
    log: [],
    fetching: false,
  },
  dialogs: {
    add: {
      isOpen: false,
      permission: '',
    },
    remove: {
      isOpen: false,
      permission: '',
      username: '',
    },
  },
});