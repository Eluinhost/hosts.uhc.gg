/* eslint-disable import-x/export */
import {
  TypedUseSelectorHook,
  useDispatch as originalUseDispatch,
  useSelector as originalUseSelector,
} from 'react-redux-original';
import { createStore } from 'redux';

import { ApplicationState } from './state/ApplicationState';

export * from 'react-redux-original';

export const useDispatch: () => ReturnType<typeof createStore>['dispatch'] = originalUseDispatch;
export const useSelector: TypedUseSelectorHook<ApplicationState> = originalUseSelector;
