import { FormStateMap, reducer as formReducer } from 'redux-form';
import { combineReducers, compose, createStore, Store } from 'redux';
import * as Authentication from './AuthenticationState';
import * as HostFormInitialValues from './HostFormInitialValuesState';

export type ApplicationState = {
  readonly authentication: Authentication.AuthenticationState,
  readonly hostFormInitialData: HostFormInitialValues.HostFormInitialValuesState;
  readonly form: FormStateMap;
};

const composeEnhancers: any = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export async function createReduxStore(): Promise<Store<ApplicationState>> {
  const authenticationState = await Authentication.initialValues();
  const hostFormInitialValuesState = await HostFormInitialValues.initialValues();

  const store = createStore<ApplicationState>(
    combineReducers<ApplicationState>({
      form: formReducer,
      hostFormInitialData: HostFormInitialValues.reducer,
      authentication: Authentication.reducer,
    }),
    {
      hostFormInitialData: hostFormInitialValuesState,
      authentication: authenticationState,
      form: {},
    },
    composeEnhancers(),
  );

  HostFormInitialValues.postInit(store);

  return store;
}
