import { FormStateMap, reducer as formReducer } from 'redux-form';
import { combineReducers, compose, createStore, Store } from 'redux';
import {
  AuthenticationState,
  initialValues as authInitialValues,
  reducer as authenticationReducer,
} from './AuthenticationState';
import {
  HostFormInitialValuesState,
  initialValues as hostFormInitialValues,
  reducer as hostFormInitialValuesReducer,
  postInit as hostFormInitialValuesPostInit,
} from './HostFormInitialValuesState';

export type ApplicationState = {
  readonly authentication: AuthenticationState,
  readonly hostFormInitialData: HostFormInitialValuesState;
  readonly form: FormStateMap;
};

const composeEnhancers: any = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export async function createReduxStore(): Promise<Store<ApplicationState>> {
  const authenticationState = await authInitialValues();
  const hostFormInitialValuesState = await hostFormInitialValues();

  const store = createStore<ApplicationState>(
    combineReducers<ApplicationState>({
      form: formReducer,
      hostFormInitialData: hostFormInitialValuesReducer,
      authentication: authenticationReducer,
    }),
    {
      hostFormInitialData: hostFormInitialValuesState,
      authentication: authenticationState,
      form: {},
    },
    composeEnhancers(),
  );

  hostFormInitialValuesPostInit(store);

  return store;
}
