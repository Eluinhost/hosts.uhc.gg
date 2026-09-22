import { applyMiddleware, combineReducers, compose, legacy_createStore, type Store } from 'redux';
import createSagaMiddleware from 'redux-saga';

import { reducer as hostingApplications } from '../hosting-applications/reducer';
import sagas from '../sagas';
import { syncWithStorage } from '../sagas/syncWithStorage';

import { reducer as ApiKey, type ApiKeyState } from './ApiKeyState';
import { reducer as HostFormSavedData, type HostFormSavedDataState } from './HostFormSavedDataState';
import { reducer as HostHistory, type HostHistoryState } from './HostHistoryState';
import { reducer as MatchDetails, type MatchDetailsState } from './MatchDetailsState';
import { reducer as MatchModeration, type MatchModerationState } from './MatchModerationState';
import { reducer as TimeSync, type TimeSyncState } from './TimeSyncState';
import { reducer as Upcoming, type UpcomingState } from './UpcomingState';

export type ApplicationState = {
  readonly upcoming: UpcomingState;
  readonly matchModeration: MatchModerationState;
  readonly matchDetails: MatchDetailsState;
  readonly hostHistory: HostHistoryState;
  readonly apiKey: ApiKeyState;
  readonly timeSync: TimeSyncState;
  readonly hostFormSavedData: HostFormSavedDataState;
  readonly hostingApplications: ReturnType<typeof hostingApplications>;
};

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const sagaMiddleware = createSagaMiddleware();

export const createReduxStore = async (): Promise<Store<ApplicationState>> => {
  const store = legacy_createStore(
    combineReducers({
      upcoming: Upcoming,
      matchModeration: MatchModeration,
      hostHistory: HostHistory,
      matchDetails: MatchDetails,
      apiKey: ApiKey,
      timeSync: TimeSync,
      hostFormSavedData: HostFormSavedData,
      hostingApplications,
    }),
    composeEnhancers(applyMiddleware(sagaMiddleware)),
  );

  sagaMiddleware.run(sagas);

  // wait for storage sync then return the store
  return sagaMiddleware
    .run(syncWithStorage)
    .toPromise()
    .then(() => store);
};
