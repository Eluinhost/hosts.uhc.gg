import { ApplicationReducer, ReducerBuilder } from './ReducerBuilder';
import { SyncTime } from '../actions';

export type TimeSyncState = {
  readonly synced: boolean;
  readonly offset: number;
};

export const reducer: ApplicationReducer<TimeSyncState> = ReducerBuilder
  .withInitialState<TimeSyncState>({
    synced: false,
    offset: 0,
  })
  .handle(SyncTime.started, (prev, action) => ({
    synced: false,
    offset: prev.offset,
  }))
  .handle(SyncTime.success, (prev, action) => ({
    synced: true,
    offset: action.payload!.result,
  }))
  .handle(SyncTime.failure, (prev, action) => ({
    synced: false,
    offset: prev.offset,
  }))
  .build();
