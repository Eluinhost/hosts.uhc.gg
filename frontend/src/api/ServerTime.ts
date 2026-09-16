import dayjs, { type Dayjs } from '../dayjs';

import { fetchObject } from './util';

export const fetchServerTime = (): Promise<Dayjs> =>
  fetchObject<string>({
    url: `/api/sync`,
  }).then(response => dayjs.utc(response));
