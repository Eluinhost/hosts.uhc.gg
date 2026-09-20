/* eslint-disable import-x/export */
import {
  type TypedUseSelectorHook,
  type UseStore,
  useDispatch as originalUseDispatch,
  useSelector as originalUseSelector,
  useStore as originalUseStore,
} from 'react-redux-original';
import { createStore, type Store } from 'redux';

import type { ApplicationState } from './state/ApplicationState';

export * from 'react-redux-original';

export const useDispatch: () => ReturnType<typeof createStore>['dispatch'] = originalUseDispatch;
export const useSelector: TypedUseSelectorHook<ApplicationState> = originalUseSelector;
export const useStore: UseStore<Store<ApplicationState>> = originalUseStore as UseStore<Store<ApplicationState>>;
