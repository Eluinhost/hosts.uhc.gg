import { atomWithStorage } from 'jotai/utils';

export const isDarkModeAtom = atomWithStorage<boolean>('uhcgg.settings.isDarkMode', true, undefined, {
  getOnInit: true,
});
