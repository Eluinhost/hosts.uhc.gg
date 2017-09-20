import { ThunkAction } from 'redux-thunk';
import { Action, createAction } from 'redux-actions';
import { ApplicationState } from './ApplicationState';
import * as moment from 'moment-timezone';
import { getServerTime } from '../api/index';
import { always } from 'ramda';
import { ReducerBuilder } from './ReducerBuilder';
import { Store } from 'redux';

export type TimeSyncState = {
  readonly synced: boolean;
  readonly offset: number;
};

const startSync = createAction('START_TIME_SYNC');
const endSync = createAction<number>('END_TIME_SYNC');
const syncError = createAction<string>('TIME_SYNC_ERROR');

export const TimeSyncActions = {
  sync: (): ThunkAction<Promise<number>, ApplicationState, {}> => async (dispatch): Promise<number> => {
    dispatch(startSync());

    try {
      const serverTime = await getServerTime();
      const diff = serverTime.diff(moment.utc());

      dispatch(endSync(diff));

      return diff;
    } catch (err) {
      dispatch(syncError(err));
      throw err;
    }
  },
};

export const reducer = new ReducerBuilder<TimeSyncState>()
  .handleEvolve(startSync, () => ({
    synced: always(false),
  }))
  .handleEvolve(endSync, (action: Action<number>) => ({
    synced: always(true),
    offset: always(action.payload!),
  }))
  .handleEvolve(syncError, () => ({
    synced: always(false),
  }))
  .build();

export const initialValues = async (): Promise<TimeSyncState> => ({
  synced: false,
  offset: 0,
});

export const postInit = (store: Store<ApplicationState>): void  => {
  const update = (): void => {
    store.dispatch(TimeSyncActions.sync());
  };

  // TODO keep retrying until successful

  window.setTimeout(update, 1000);
};
