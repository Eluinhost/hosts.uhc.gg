import * as moment from 'moment-timezone';
import { map, pipe, sortBy } from 'ramda';

import { fetchArray } from '../api/util';
import { Match } from '../models/Match';

const transformMatches: (matches: Match[]) => Match[] = pipe(
  // convert the API using strings into actual moment objects
  map(
    (match: Match): Match => ({
      ...match,
      opens: moment.utc(match.opens),
      created: moment.utc(match.created),
    }),
  ),
  // sort the edits by their created date
  sortBy(m => m.created.unix()),
);

export const fetchMatchEditHistory = (id: number): Promise<Match[]> =>
  fetchArray<Match>({
    url: `/api/matches/${id}/edits`,
  }).then(transformMatches);
