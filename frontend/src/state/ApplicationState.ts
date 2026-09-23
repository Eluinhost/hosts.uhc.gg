import { applyMiddleware, combineReducers, compose, legacy_createStore, type Store } from 'redux';
import createSagaMiddleware from 'redux-saga';

import { reducer as hostingApplications } from '../hosting-applications/reducer';
import sagas from '../sagas';

import { reducer as MatchModeration, type MatchModerationState } from './MatchModerationState';

export type ApplicationState = {
  readonly matchModeration: MatchModerationState;
  readonly hostingApplications: ReturnType<typeof hostingApplications>;
};

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const sagaMiddleware = createSagaMiddleware();

export const createReduxStore = (): Store<ApplicationState> => {
  const store = legacy_createStore(
    combineReducers({
      matchModeration: MatchModeration,
      hostingApplications,
    }),
    composeEnhancers(applyMiddleware(sagaMiddleware)),
  );

  sagaMiddleware.run(sagas);

  return store;
};
