import { atomWithStorage } from 'jotai/utils';

import dayjs from '../dayjs';

export const timezoneAtom = atomWithStorage<string>('uhcgg.settings.timezone', dayjs.tz.guess(), undefined, {
  getOnInit: true,
});
