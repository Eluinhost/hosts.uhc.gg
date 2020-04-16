import { FormStateMap, reducer as formReducer } from 'redux-form';
import { applyMiddleware, combineReducers, compose, createStore, Store } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { reducer as Authentication, AuthenticationState } from './AuthenticationState';
import { reducer as Upcoming, UpcomingState } from './UpcomingState';
import { reducer as MatchModeration, MatchModerationState } from './MatchModerationState';
import { reducer as HostHistory, HostHistoryState } from './HostHistoryState';
import { reducer as MatchDetails, MatchDetailsState } from './MatchDetailsState';
import { reducer as Permissions, PermissionsState } from './PermissionsState';
import { reducer as PermissionModerationLog, PermissionModerationLogState } from './PermissionModerationLogState';
import { reducer as ApiKey, ApiKeyState } from './ApiKeyState';
import { reducer as HostingRules, HostingRulesState } from './HostingRulesState';
import { reducer as HostFormConflicts, HostFormConflictsState } from './HostFormConflictsState';
import { reducer as Settings, SettingsState } from './SettingsState';
import { reducer as TimeSync, TimeSyncState } from './TimeSyncState';
import { reducer as HostFormSavedData, HostFormSavedDataState } from './HostFormSavedDataState';
import { reducer as modifiers, ModifiersState } from '../modifiers/reducer';
import { reducer as versions, VersionsState } from '../versions/reducer';
import sagas from '../sagas';
import { syncWithStorage } from '../sagas/syncWithStorage';

export type ApplicationState = {
  readonly authentication: AuthenticationState;
  readonly form: FormStateMap;
  readonly upcoming: UpcomingState;
  readonly matchModeration: MatchModerationState;
  readonly matchDetails: MatchDetailsState;
  readonly hostHistory: HostHistoryState;
  readonly permissions: PermissionsState;
  readonly permissionModerationLog: PermissionModerationLogState;
  readonly apiKey: ApiKeyState;
  readonly rules: HostingRulesState;
  readonly hostFormConflicts: HostFormConflictsState;
  readonly settings: SettingsState;
  readonly timeSync: TimeSyncState;
  readonly hostFormSavedData: HostFormSavedDataState;
  readonly modifiers: ModifiersState;
  readonly versions: VersionsState;
};

const composeEnhancers: any = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export const sagaMiddleware = createSagaMiddleware();

export const createReduxStore = async (): Promise<Store<ApplicationState>> => {
  const store = createStore(
    combineReducers<ApplicationState>({
      form: (state, action) => formReducer(state!, action),
      authentication: Authentication,
      upcoming: Upcoming,
      matchModeration: MatchModeration,
      hostHistory: HostHistory,
      matchDetails: MatchDetails,
      permissions: Permissions,
      permissionModerationLog: PermissionModerationLog,
      apiKey: ApiKey,
      rules: HostingRules,
      hostFormConflicts: HostFormConflicts,
      settings: Settings,
      timeSync: TimeSync,
      hostFormSavedData: HostFormSavedData,
      modifiers,
      versions,
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
