import { Match } from '../models/Match';
import * as moment from 'moment-timezone';
import { authHeaders, callApi, fetchArray, maybeFetchObject } from './util';
import { CreateMatchData } from '../models/CreateMatchData';

const matchMomentProps: [keyof Match] = ['opens', 'created'];

export const fetchUpcomingMatches = (): Promise<Match[]> =>
  fetchArray<Match>({
    url: `/api/matches/upcoming`,
    momentProps: matchMomentProps,
  });

export const fetchSingle = (id: number): Promise<Match | null> =>
  maybeFetchObject<Match>({
    url: `/api/matches/${id}`,
    momentProps: matchMomentProps,
  });

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

export const create = (data: CreateMatchData, accessToken: string): Promise<void> =>
  callApi({
    url: `/api/matches`,
    status: 201,
    config: {
      method: 'POST',
      headers: {
        ...authHeaders(accessToken),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        opens: data.opens.clone().utc(),
      }),
    },
  });

export const fetchPotentialConflicts = (region: string, time: moment.Moment): Promise<Match[]> =>
  fetchArray<Match>({
    url: `/api/matches/conflicts/${region}/${time
      .clone()
      .utc()
      .format()}`,
    momentProps: matchMomentProps,
  });

export const fetchHistoryForHost = (host: string, before?: number): Promise<Match[]> =>
  fetchArray<Match>({
    url: `/api/hosts/${host}/matches?before=${before || ''}`,
    momentProps: matchMomentProps,
  });
