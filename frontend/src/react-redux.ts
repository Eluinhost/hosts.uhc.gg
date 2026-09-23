/* eslint-disable import-x/export */
import {
  type TypedUseSelectorHook,
  useDispatch as originalUseDispatch,
  useSelector as originalUseSelector,
} from 'react-redux-original';
import { legacy_createStore } from 'redux';

export * from 'react-redux-original';

export const useDispatch: () => ReturnType<typeof legacy_createStore>['dispatch'] = originalUseDispatch;
export const useSelector: TypedUseSelectorHook<Record<string, never>> = originalUseSelector;
