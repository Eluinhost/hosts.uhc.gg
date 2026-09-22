import dayjs from '../dayjs';
import type { CreateMatchData } from '../models/CreateMatchData';
import type { Match } from '../models/Match';

import { authHeaders, callApi, fetchArray } from './util';

export const fetchUpcomingMatches = (): Promise<Match[]> =>
  fetchArray<Match>({
    url: `/api/matches/upcoming`,
  }).then(matches =>
    matches.map(match => ({
      ...match,
      opens: dayjs.utc(match.opens),
      created: dayjs.utc(match.created),
      removedAt: match.removedAt && dayjs.utc(match.removedAt),
    })),
  );

export const callRemove = (id: number, reason: string, accessToken: string): Promise<void> =>
  callApi({
    url: `/api/matches/${id}`,
    status: 204,
    config: {
      method: 'DELETE',
      headers: {
        ...authHeaders(accessToken),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    },
  });

export const callApprove = (id: number, accessToken: string): Promise<void> =>
  callApi({
    url: `/api/matches/${id}/approve`,
    config: {
      method: 'POST',
      headers: authHeaders(accessToken),
    },
  });

export const create = (data: CreateMatchData, accessToken: string): Promise<void> => {
  const body: Partial<Match> = {
    ...data,
    opens: data.opens.utc(),
    // convert the modifiers into scenarios
    scenarios: [...data.modifiers, ...data.scenarios],
  };

  return callApi({
    url: `/api/matches`,
    status: 201,
    config: {
      method: 'POST',
      headers: {
        ...authHeaders(accessToken),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
  });
};

export const fetchHistoryForHost = (host: string, before?: number): Promise<Match[]> =>
  fetchArray<Match>({
    url: `/api/hosts/${host}/matches?before=${before || ''}`,
  }).then(matches =>
    matches.map(match => ({
      ...match,
      opens: dayjs.utc(match.opens),
      created: dayjs.utc(match.created),
      removedAt: match.removedAt && dayjs.utc(match.removedAt),
    })),
  );
