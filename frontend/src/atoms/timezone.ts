import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

import dayjs from '@/dayjs';

export const SUPPORTED_TIMEZONES = Intl.supportedValuesOf('timeZone');
export const TRIGGER_AUTO_DETECTION = 'TRIGGER_AUTO_DETECTION';

const autoDetect = () => dayjs.tz.guess();

// TODO do we need to validate that stored tz are valid? Would only break if their browser removed something that was valid previously
export const storedTimezoneAtom = atomWithStorage<string>('uhcgg.settings.timezone', autoDetect(), undefined, {
  getOnInit: true,
});

export const timezoneAtom = atom(
  get => {
    const value = get(storedTimezoneAtom);

    return SUPPORTED_TIMEZONES.includes(value) ? value : autoDetect();
  },
  (_get, set, newValue: string) => {
    if (newValue === TRIGGER_AUTO_DETECTION || !SUPPORTED_TIMEZONES.includes(newValue)) {
      set(storedTimezoneAtom, autoDetect());
    } else {
      set(storedTimezoneAtom, newValue);
    }
  },
);
