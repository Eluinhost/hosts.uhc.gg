import { atomWithStorage } from 'jotai/utils';

export const hideRemovedAtom = atomWithStorage('uhcgg.settings.hideRemoved', true, undefined, { getOnInit: true });
export const showOwnRemovedAtom = atomWithStorage('uhcgg.settings.showOwnRemoved', true, undefined, {
  getOnInit: true,
});
