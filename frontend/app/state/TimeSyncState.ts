import { ApplicationState } from './ApplicationState';
import { ReducerBuilder } from './ReducerBuilder';
import { Store } from 'redux';
import { SyncTime } from '../actions';

export type TimeSyncState = {
  readonly synced: boolean;
  readonly offset: number;
};

export const reducer = new ReducerBuilder<TimeSyncState>()
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

export const initialValues = async (): Promise<TimeSyncState> => ({
  synced: false,
  offset: 0,
});
