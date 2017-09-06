import { ThunkAction } from 'redux-thunk';
import { ApplicationState } from './ApplicationState';
import { Action, createAction } from 'redux-actions';
import { ReducerBuilder } from './ReducerBuilder';
import { always } from 'ramda';
import { storage } from '../storage';

const storageKey = 'settings';

export type SettingsState = {
  readonly isDarkMode: boolean;
};

const setDarkMode = createAction<boolean>('SET_DARK_MODE');

export const SettingsActions = {
  toggleDarkMode: (): ThunkAction<void, ApplicationState, {}> => (dispatch, getState) => {
    const now = getState().settings.isDarkMode;
    storage.setItem(`${storageKey}.isDarkMode`, !now);
    dispatch(setDarkMode(!now));
  },
};

export const reducer = new ReducerBuilder<SettingsState>()
  .handleEvolve(setDarkMode, (action: Action<boolean>) => ({
    isDarkMode: always(action.payload),
  }))
  .build();

export const initialValues = async (): Promise<SettingsState> => {
  const saved = await storage.getItem<boolean>(`${storageKey}.isDarkMode`);

  return {
    isDarkMode: saved === null ? true : saved,
  };
};
