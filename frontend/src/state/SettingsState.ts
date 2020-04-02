import { createReducer } from 'typesafe-redux-helpers';
import { Reducer } from 'redux';
import moment from 'moment-timezone';

import { Settings } from '../actions';

const storageKey = 'settings';
// TODO remove storageKey out of store + move below to sagas
// const savedDarkMode = await storage.getItem<boolean>(`${storageKey}.isDarkMode`);
// const saved12h = await storage.getItem<boolean>(`${storageKey}.is12h`);
// const savedTimezone = await storage.getItem<string>(`${storageKey}.timezone`);
// const hideRemoved = await storage.getItem<boolean>(`${storageKey}.hideRemoved`);
// const showOwnRemoved = await storage.getItem<boolean>(`${storageKey}.showOwnRemoved`);

export type SettingsState = {
  readonly isDarkMode: boolean;
  readonly is12h: boolean;
  readonly timezone: string;
  readonly hideRemoved: boolean;
  readonly showOwnRemoved: boolean;
  readonly storageKey: string;
};

export const reducer: Reducer<SettingsState> = createReducer<SettingsState>({
  storageKey,
  isDarkMode: false,
  is12h: false,
  timezone: moment.tz.guess(),
  hideRemoved: true,
  showOwnRemoved: true,
})
  .handleAction(Settings.setDarkMode, (state, action) => ({
    ...state,
    isDarkMode: action.payload,
  }))
  .handleAction(Settings.setIs12h, (state, action) => ({
    ...state,
    is12h: action.payload,
  }))
  .handleAction(Settings.setTimezone, (state, action) => ({
    ...state,
    timezone: action.payload,
  }))
  .handleAction(Settings.setHideRemoved, (state, action) => ({
    ...state,
    hideRemoved: action.payload,
  }))
  .handleAction(Settings.setShowOwnRemoved, (state, action) => ({
    ...state,
    showOwnRemoved: action.payload,
  }));
