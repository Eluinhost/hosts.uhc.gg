import { ApplicationReducer, ReducerBuilder } from './ReducerBuilder';
import * as momentTz from 'moment-timezone';
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

export const reducer: ApplicationReducer<SettingsState> = ReducerBuilder.withInitialState<SettingsState>({
  storageKey,
  isDarkMode: false,
  is12h: false,
  timezone: momentTz.tz.guess(),
  hideRemoved: true,
  showOwnRemoved: true,
})
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
