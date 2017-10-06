import thunkMiddleware from 'redux-thunk';
import { FormStateMap, reducer as formReducer } from 'redux-form';
import { applyMiddleware, combineReducers, compose, createStore, Store } from 'redux';
import createSagaMiddleware from 'redux-saga';
import * as Authentication from './AuthenticationState';
import * as Upcoming from './UpcomingState';
import * as MatchModeration from './MatchModerationState';
import * as HostHistory from './HostHistoryState';
import * as MatchDetails from './MatchDetailsState';
import * as Permissions from './PermissionsState';
import * as PermissionModerationLog from './PermissionModerationLogState';
import * as ApiKey from './ApiKeyState';
import * as HostingRules from './HostingRulesState';
import * as HostFormConflicts from './HostFormConflictsState';
import * as Settings from './SettingsState';
import * as TimeSync from './TimeSyncState';
import sagas from '../sagas';

export type ApplicationState = {
  readonly authentication: Authentication.AuthenticationState,
  readonly form: FormStateMap;
  readonly upcoming: Upcoming.UpcomingState;
  readonly matchModeration: MatchModeration.MatchModerationState;
  readonly matchDetails: MatchDetails.MatchDetailsState;
  readonly hostHistory: HostHistory.HostHistoryState;
  readonly permissions: Permissions.PermissionsState;
  readonly permissionModerationLog: PermissionModerationLog.PermissionModerationLogState;
  readonly apiKey: ApiKey.ApiKeyState;
  readonly rules: HostingRules.HostingRulesState;
  readonly hostFormConflicts: HostFormConflicts.HostFormConflictsState;
  readonly settings: Settings.SettingsState;
  readonly timeSync: TimeSync.TimeSyncState;
};

const composeEnhancers: any = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export const createReduxStore = async (): Promise<Store<ApplicationState>> => {
  const authenticationState = await Authentication.initialValues();
  const upcomingState = await Upcoming.initialValues();
  const matchModerationState = await MatchModeration.initialValues();
  const hostHistoryState = await HostHistory.initialValues();
  const matchDetailsState = await MatchDetails.initialValues();
  const permissionsState = await Permissions.initialValues();
  const permissionModerationLogState = await PermissionModerationLog.initialValues();
  const apiKeyState = await ApiKey.initialValues();
  const hostingRulesState = await HostingRules.initialValues();
  const hostFormConflictsState = await HostFormConflicts.initialValues();
  const settingsState = await Settings.initialValues();
  const timeSyncState = await TimeSync.initialValues();

  const sagaMiddleware = createSagaMiddleware();

  const store = createStore<ApplicationState>(
    combineReducers<ApplicationState>({
      form: formReducer,
      authentication: Authentication.reducer,
      upcoming: Upcoming.reducer,
      matchModeration: MatchModeration.reducer,
      hostHistory: HostHistory.reducer,
      matchDetails: MatchDetails.reducer,
      permissions: Permissions.reducer,
      permissionModerationLog: PermissionModerationLog.reducer,
      apiKey: ApiKey.reducer,
      rules: HostingRules.reducer,
      hostFormConflicts: HostFormConflicts.reducer,
      settings: Settings.reducer,
      timeSync: TimeSync.reducer,
    }),
    {
      authentication: authenticationState,
      form: {},
      upcoming: upcomingState,
      matchModeration: matchModerationState,
      hostHistory: hostHistoryState,
      matchDetails: matchDetailsState,
      permissions: permissionsState,
      permissionModerationLog: permissionModerationLogState,
      apiKey: apiKeyState,
      rules: hostingRulesState,
      hostFormConflicts: hostFormConflictsState,
      settings: settingsState,
      timeSync: timeSyncState,
    },
    composeEnhancers(applyMiddleware(thunkMiddleware, sagaMiddleware)),
  );

  sagaMiddleware.run(sagas);

  return store;
};
