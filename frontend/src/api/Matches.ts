import moment from 'moment-timezone';
import qs from 'query-string';

import type { CreateMatchData } from '../models/CreateMatchData';
import type { Match } from '../models/Match';

import { authHeaders, callApi, fetchArray, maybeFetchObject } from './util';

export const fetchUpcomingMatches = (): Promise<Match[]> =>
  fetchArray<Match>({
    url: `/api/matches/upcoming`,
  }).then(matches =>
    matches.map(match => ({
      ...match,
      opens: moment.utc(match.opens),
      created: moment.utc(match.created),
      removedAt: match.removedAt && moment.utc(match.removedAt),
    })),
  );

export const fetchSingle = (id: number): Promise<Match | null> =>
  maybeFetchObject<Match>({
    url: `/api/matches/${id}`,
  }).then(
    match =>
      match && {
        ...match,
        opens: moment.utc(match.opens),
        created: moment.utc(match.created),
        removedAt: match.removedAt && moment.utc(match.removedAt),
      },
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
    version: data.version || data.mainVersion, // use the main version if no range was provided
    opens: data.opens.clone().utc(),
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

export const fetchPotentialConflicts = (region: string, time: moment.Moment, version: string): Promise<Match[]> =>
  fetchArray<Match>({
    url: `/api/matches/conflicts?${qs.stringify({ region, opens: time.toISOString(), version })}`,
    status: 200,
  }).then(matches =>
    matches.map(match => ({
      ...match,
      opens: moment.utc(match.opens),
      created: moment.utc(match.created),
      removedAt: match.removedAt && moment.utc(match.removedAt),
    })),
  );

export const fetchHistoryForHost = (host: string, before?: number): Promise<Match[]> =>
  fetchArray<Match>({
    url: `/api/hosts/${host}/matches?before=${before || ''}`,
  }).then(matches =>
    matches.map(match => ({
      ...match,
      opens: moment.utc(match.opens),
      created: moment.utc(match.created),
      removedAt: match.removedAt && moment.utc(match.removedAt),
    })),
  );
