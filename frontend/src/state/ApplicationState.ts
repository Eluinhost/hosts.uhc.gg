import { applyMiddleware, combineReducers, compose, createStore, type Store } from 'redux';
import createSagaMiddleware from 'redux-saga';

import { reducer as hostingApplications } from '../hosting-applications/reducer';
import sagas from '../sagas';
import { syncWithStorage } from '../sagas/syncWithStorage';

import { reducer as ApiKey, type ApiKeyState } from './ApiKeyState';
import { reducer as Authentication, type AuthenticationState } from './AuthenticationState';
import { reducer as HostFormConflicts, type HostFormConflictsState } from './HostFormConflictsState';
import { reducer as HostFormSavedData, type HostFormSavedDataState } from './HostFormSavedDataState';
import { reducer as HostHistory, type HostHistoryState } from './HostHistoryState';
import { reducer as HostingRules, type HostingRulesState } from './HostingRulesState';
import { reducer as MatchDetails, type MatchDetailsState } from './MatchDetailsState';
import { reducer as MatchModeration, type MatchModerationState } from './MatchModerationState';
import { reducer as Presets, type PresetsState } from './PresetsState';
import { reducer as Settings, type SettingsState } from './SettingsState';
import { reducer as TimeSync, type TimeSyncState } from './TimeSyncState';
import { reducer as Upcoming, type UpcomingState } from './UpcomingState';

export type ApplicationState = {
  readonly authentication: AuthenticationState;
  readonly upcoming: UpcomingState;
  readonly matchModeration: MatchModerationState;
  readonly matchDetails: MatchDetailsState;
  readonly hostHistory: HostHistoryState;
  readonly apiKey: ApiKeyState;
  readonly rules: HostingRulesState;
  readonly hostFormConflicts: HostFormConflictsState;
  readonly settings: SettingsState;
  readonly timeSync: TimeSyncState;
  readonly hostFormSavedData: HostFormSavedDataState;
  readonly presets: PresetsState;
  readonly hostingApplications: ReturnType<typeof hostingApplications>;
};

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const sagaMiddleware = createSagaMiddleware();

export const createReduxStore = async (): Promise<Store<ApplicationState>> => {
  const store = createStore(
    combineReducers<ApplicationState>({
      authentication: Authentication,
      upcoming: Upcoming,
      matchModeration: MatchModeration,
      hostHistory: HostHistory,
      matchDetails: MatchDetails,
      apiKey: ApiKey,
      rules: HostingRules,
      hostFormConflicts: HostFormConflicts,
      settings: Settings,
      timeSync: TimeSync,
      hostFormSavedData: HostFormSavedData,
      presets: Presets,
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
