import thunkMiddleware from 'redux-thunk';
import { FormStateMap, reducer as formReducer } from 'redux-form';
import { applyMiddleware, combineReducers, compose, createStore, Store } from 'redux';
import * as Authentication from './AuthenticationState';
import * as HostFormInitialValues from './HostFormInitialValuesState';
import * as MatchModeration from './MatchModerationState';

export type ApplicationState = {
  readonly authentication: Authentication.AuthenticationState,
  readonly hostFormInitialData: HostFormInitialValues.HostFormInitialValuesState;
  readonly form: FormStateMap;
  readonly matchModeration: MatchModeration.MatchModerationState;
};

const composeEnhancers: any = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export async function createReduxStore(): Promise<Store<ApplicationState>> {
  const authenticationState = await Authentication.initialValues();
  const hostFormInitialValuesState = await HostFormInitialValues.initialValues();
  const matchModerationState = await MatchModeration.initialValues();

  const store = createStore<ApplicationState>(
    combineReducers<ApplicationState>({
      form: formReducer,
      hostFormInitialData: HostFormInitialValues.reducer,
      authentication: Authentication.reducer,
      matchModeration: MatchModeration.reducer,
    }),
    {
      hostFormInitialData: hostFormInitialValuesState,
      authentication: authenticationState,
      form: {},
      matchModeration: matchModerationState,
    },
    composeEnhancers(applyMiddleware(thunkMiddleware)),
  );

  HostFormInitialValues.postInit(store);

  return store;
}
