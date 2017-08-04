import thunkMiddleware from 'redux-thunk';
import { FormStateMap, reducer as formReducer } from 'redux-form';
import { applyMiddleware, combineReducers, compose, createStore, Store } from 'redux';
import * as Authentication from './AuthenticationState';
import * as Matches from './MatchesState';
import * as Members from './MembersState';
import * as Profile from './ProfileState';
import * as HostingRules from './HostingRulesState';

export type ApplicationState = {
  readonly authentication: Authentication.AuthenticationState,
  readonly form: FormStateMap;
  readonly matches: Matches.MatchesState;
  readonly members: Members.MembersState;
  readonly profile: Profile.ProfileState;
  readonly rules: HostingRules.HostingRulesState;
};

const composeEnhancers: any = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export const createReduxStore = async (): Promise<Store<ApplicationState>> => {
  const authenticationState = await Authentication.initialValues();
  const matchesState = await Matches.initialValues();
  const membersState = await Members.initialValues();
  const profileState = await Profile.initialValues();
  const hostingRulesState = await HostingRules.initialValues();

  const store = createStore<ApplicationState>(
    combineReducers<ApplicationState>({
      form: formReducer,
      authentication: Authentication.reducer,
      matches: Matches.reducer,
      members: Members.reducer,
      profile: Profile.reducer,
      rules: HostingRules.reducer,
    }),
    {
      authentication: authenticationState,
      form: {},
      matches: matchesState,
      members: membersState,
      profile: profileState,
      rules: hostingRulesState,
    },
    composeEnhancers(applyMiddleware(thunkMiddleware)),
  );

  Authentication.postInit(store);

  return store;
};
