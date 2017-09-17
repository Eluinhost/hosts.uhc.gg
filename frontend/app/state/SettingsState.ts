import { ThunkAction } from 'redux-thunk';
import { ApplicationState } from './ApplicationState';
import { Action, createAction } from 'redux-actions';
import { ReducerBuilder } from './ReducerBuilder';
import { always } from 'ramda';
import { storage } from '../storage';

const storageKey = 'settings';

export type SettingsState = {
  readonly isDarkMode: boolean;
  readonly is12h: boolean;
};

const setDarkMode = createAction<boolean>('SET_DARK_MODE');
const setIs12h = createAction<boolean>('SET_IS_12_H_FORMAT');

export const SettingsActions = {
  toggleDarkMode: (): ThunkAction<void, ApplicationState, {}> => (dispatch, getState) => {
    const now = getState().settings.isDarkMode;
    storage.setItem(`${storageKey}.isDarkMode`, !now);
    dispatch(setDarkMode(!now));
  },
  toggle12hFormat: (): ThunkAction<void, ApplicationState, {}> => (dispatch, getState) => {
    const existing = getState().settings.is12h;
    storage.setItem(`${storageKey}.is12h`, !existing);
    dispatch(setIs12h(!existing));
  },
};

export const reducer = new ReducerBuilder<SettingsState>()
  .handleEvolve(setDarkMode, (action: Action<boolean>) => ({
    isDarkMode: always(action.payload),
  }))
  .handleEvolve(setIs12h, (action: Action<boolean>) => ({
    is12h: always(action.payload),
  }))
  .build();

export const initialValues = async (): Promise<SettingsState> => {
  const savedDarkMode = await storage.getItem<boolean>(`${storageKey}.isDarkMode`);
  const saved12h = await storage.getItem<boolean>(`${storageKey}.is12h`);

  return {
    isDarkMode: savedDarkMode === null ? false : savedDarkMode,
    is12h: saved12h === null ? false : saved12h,
  };
};
