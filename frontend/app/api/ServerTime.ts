
import * as moment from 'moment-timezone';
import { convertUnixToMoment, fetchObject } from './util';

export const fetchServerTime = (): Promise<moment.Moment> => fetchObject<string>({
  url: `/api/sync`,
}).then(convertUnixToMoment);
