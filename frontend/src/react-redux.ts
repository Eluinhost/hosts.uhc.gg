import {
  TypedUseSelectorHook,
  useDispatch as originalUseDispatch,
  useSelector as originalUseSelector,
} from 'react-redux-original';
import { ApplicationState } from './state/ApplicationState';
import { createStore } from 'redux';

export * from 'react-redux-original';

export const useDispatch: () => ReturnType<typeof createStore>['dispatch'] = originalUseDispatch;
export const useSelector: TypedUseSelectorHook<ApplicationState> = originalUseSelector;
