import { createReducer } from 'typesafe-redux-helpers';
import { Reducer } from 'redux';

import { SyncTime } from '../actions';

export type TimeSyncState = {
  readonly synced: boolean;
  readonly offset: number;
};

export const reducer: Reducer<TimeSyncState> = createReducer<TimeSyncState>({
  synced: false,
  offset: 0,
})
  .handleAction(SyncTime.started, state => ({
    synced: false,
    offset: state.offset,
  }))
  .handleAction(SyncTime.success, (state, action) => ({
    synced: true,
    offset: action.payload.result,
  }))
  .handleAction(SyncTime.failure, state => ({
    synced: false,
    offset: state.offset,
  }));
