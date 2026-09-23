import { applyMiddleware, combineReducers, compose, legacy_createStore, type Store } from 'redux';
import createSagaMiddleware from 'redux-saga';

import sagas from '../sagas';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const sagaMiddleware = createSagaMiddleware();

export const createReduxStore = (): Store<Record<string, never>> => {
  const store = legacy_createStore(combineReducers({}), composeEnhancers(applyMiddleware(sagaMiddleware)));

  sagaMiddleware.run(sagas);

  return store;
};
