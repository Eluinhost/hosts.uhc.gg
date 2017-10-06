import { ReducerBuilder } from './ReducerBuilder';
import { storage } from '../storage';
import * as moment from 'moment-timezone';
import { Settings } from '../actions';

const storageKey = 'settings';

export type SettingsState = {
  readonly isDarkMode: boolean;
  readonly is12h: boolean;
  readonly timezone: string;
  readonly hideRemoved: boolean;
  readonly showOwnRemoved: boolean;
  readonly storageKey: string;
};

export const reducer = new ReducerBuilder<SettingsState>()
  .handle(Settings.setDarkMode, (prev, action) => ({
    ...prev,
    isDarkMode: action.payload!,
  }))
  .handle(Settings.setIs12h, (prev, action) => ({
    ...prev,
    is12h: action.payload!,
  }))
  .handle(Settings.setTimezone, (prev, action) => ({
    ...prev,
    timezone: action.payload!,
  }))
  .handle(Settings.setHideRemoved, (prev, action) => ({
    ...prev,
    hideRemoved: action.payload!,
  }))
  .handle(Settings.setShowOwnRemoved, (prev, action) => ({
    ...prev,
    showOwnRemoved: action.payload!,
  }))
  .build();

export const initialValues = async (): Promise<SettingsState> => {
  const savedDarkMode = await storage.getItem<boolean>(`${storageKey}.isDarkMode`);
  const saved12h = await storage.getItem<boolean>(`${storageKey}.is12h`);
  const savedTimezone = await storage.getItem<string>(`${storageKey}.timezone`);
  const hideRemoved = await storage.getItem<boolean>(`${storageKey}.hideRemoved`);
  const showOwnRemoved = await storage.getItem<boolean>(`${storageKey}.showOwnRemoved`);

  return {
    storageKey,
    isDarkMode: savedDarkMode === null ? false : savedDarkMode,
    is12h: saved12h === null ? false : saved12h,
    timezone: savedTimezone === null ? moment.tz.guess() : savedTimezone,
    hideRemoved: hideRemoved === null ? true : hideRemoved,
    showOwnRemoved: showOwnRemoved === null ? true : showOwnRemoved,
  };
};
