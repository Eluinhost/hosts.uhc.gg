import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export const is12hAtom = atomWithStorage('uhcgg.settings.is12h', false, undefined, { getOnInit: true });

export const timeFormatAtom = atom(get => (get(is12hAtom) ? 'h:mm A' : 'HH:mm'));

export const tagDateTimeFormatAtom = atom(get => `MMM Do ${get(timeFormatAtom)} z`);
