import moment from 'moment-timezone';
import { fetchObject } from './util';

export const fetchServerTime = (): Promise<moment.Moment> =>
  fetchObject<string>({
    url: `/api/sync`,
  }).then(response => moment.utc(response));
