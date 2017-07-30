import thunkMiddleware from 'redux-thunk';
import { FormStateMap, reducer as formReducer } from 'redux-form';
import { applyMiddleware, combineReducers, compose, createStore, Store } from 'redux';
import * as Authentication from './AuthenticationState';
import * as Matches from './MatchesState';
import * as Members from './MembersState';

export type ApplicationState = {
  readonly authentication: Authentication.AuthenticationState,
  readonly form: FormStateMap;
  readonly matches: Matches.MatchesState;
  readonly members: Members.MembersState;
};

const composeEnhancers: any = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export async function createReduxStore(): Promise<Store<ApplicationState>> {
  const authenticationState = await Authentication.initialValues();
  const matchesState = await Matches.initialValues();
  const membersState = await Members.initialValues();

  const store = createStore<ApplicationState>(
    combineReducers<ApplicationState>({
      form: formReducer,
      authentication: Authentication.reducer,
      matches: Matches.reducer,
      members: Members.reducer,
    }),
    {
      authentication: authenticationState,
      form: {},
      matches: matchesState,
      members: membersState,
    },
    composeEnhancers(applyMiddleware(thunkMiddleware)),
  );

  Authentication.postInit(store);

  return store;
}
