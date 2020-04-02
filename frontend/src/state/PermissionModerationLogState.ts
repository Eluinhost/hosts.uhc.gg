import { createReducer } from 'typesafe-redux-helpers';
import { Reducer } from 'redux';

import { RefreshPermissionModerationLog } from '../actions';
import { PermissionModerationLogEntry } from '../models/PermissionModerationLogEntry';

export type PermissionModerationLogState = {
  readonly fetching: boolean;
  readonly error: string | null;
  readonly log: PermissionModerationLogEntry[];
};

export const reducer: Reducer<PermissionModerationLogState> = createReducer<PermissionModerationLogState>({
  fetching: false,
  error: null,
  log: [],
})
  .handleAction(RefreshPermissionModerationLog.started, state => ({
    fetching: true,
    error: null,
    log: state.log,
  }))
  .handleAction(RefreshPermissionModerationLog.success, (state, action) => ({
    fetching: false,
    error: null,
    log: action.payload.result,
  }))
  .handleAction(RefreshPermissionModerationLog.failure, state => ({
    fetching: false,
    error: 'Unable to refresh from the server',
    log: state.log,
  }));
