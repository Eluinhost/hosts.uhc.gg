import { atomWithStorage } from 'jotai/utils';

export const presetsAtom = atomWithStorage<Record<string, string>>('uhcgg.settings.presets', {}, undefined, {
  getOnInit: true,
});
