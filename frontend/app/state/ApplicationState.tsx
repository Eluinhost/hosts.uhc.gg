import thunkMiddleware from 'redux-thunk';
import { FormStateMap, reducer as formReducer } from 'redux-form';
import { applyMiddleware, combineReducers, compose, createStore, Store } from 'redux';
import * as Authentication from './AuthenticationState';
import * as Matches from './MatchesState';
import * as Members from './MembersState';
import * as Profile from './ProfileState';
import * as HostingRules from './HostingRulesState';
import * as HostForm from './HostFormState';
import * as Settings from './SettingsState';
import * as TimeSync from './TimeSyncState';

export type ApplicationState = {
  readonly authentication: Authentication.AuthenticationState,
  readonly form: FormStateMap;
  readonly matches: Matches.MatchesState;
  readonly members: Members.MembersState;
  readonly profile: Profile.ProfileState;
  readonly rules: HostingRules.HostingRulesState;
  readonly hostForm: HostForm.HostFormState;
  readonly settings: Settings.SettingsState;
  readonly timeSync: TimeSync.TimeSyncState;
};

const composeEnhancers: any = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export const createReduxStore = async (): Promise<Store<ApplicationState>> => {
  const authenticationState = await Authentication.initialValues();
  const matchesState = await Matches.initialValues();
  const membersState = await Members.initialValues();
  const profileState = await Profile.initialValues();
  const hostingRulesState = await HostingRules.initialValues();
  const hostFormState = await HostForm.initialValues();
  const settingsState = await Settings.initialValues();
  const timeSyncState = await TimeSync.initialValues();

  const store = createStore<ApplicationState>(
    combineReducers<ApplicationState>({
      form: formReducer,
      authentication: Authentication.reducer,
      matches: Matches.reducer,
      members: Members.reducer,
      profile: Profile.reducer,
      rules: HostingRules.reducer,
      hostForm: HostForm.reducer,
      settings: Settings.reducer,
      timeSync: TimeSync.reducer,
    }),
    {
      authentication: authenticationState,
      form: {},
      matches: matchesState,
      members: membersState,
      profile: profileState,
      rules: hostingRulesState,
      hostForm: hostFormState,
      settings: settingsState,
      timeSync: timeSyncState,
    },
    composeEnhancers(applyMiddleware(thunkMiddleware)),
  );

  Authentication.postInit(store);
  TimeSync.postInit(store);

  return store;
};
