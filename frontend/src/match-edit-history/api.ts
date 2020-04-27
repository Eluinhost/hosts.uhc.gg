import * as moment from 'moment-timezone';

import { fetchArray } from '../api/util';
import { Match } from '../models/Match';

export const fetchMatchEditHistory = (id: number): Promise<Match[]> =>
  fetchArray<Match>({
    url: `/api/matches/${id}/edits`,
  }).then(matches =>
    matches.map(match => ({
      ...match,
      opens: moment.utc(match.opens),
      created: moment.utc(match.created),
    })),
  );
