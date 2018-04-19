import { ApplicationReducer, ReducerBuilder } from './ReducerBuilder';
import { RefreshPermissionModerationLog } from '../actions';
import { PermissionModerationLogEntry } from '../models/PermissionModerationLogEntry';

export type PermissionModerationLogState = {
  readonly fetching: boolean;
  readonly error: string | null;
  readonly log: PermissionModerationLogEntry[];
};

export const reducer: ApplicationReducer<PermissionModerationLogState> = ReducerBuilder.withInitialState<
  PermissionModerationLogState
>({
  fetching: false,
  error: null,
  log: [],
})
  .handle(RefreshPermissionModerationLog.started, (prev, action) => ({
    fetching: true,
    error: null,
    log: prev.log,
  }))
  .handle(RefreshPermissionModerationLog.success, (prev, action) => ({
    fetching: false,
    error: null,
    log: action.payload!.result,
  }))
  .handle(RefreshPermissionModerationLog.failure, (prev, action) => ({
    fetching: false,
    error: 'Unable to refresh from the server',
    log: prev.log,
  }))
  .build();
