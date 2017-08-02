import { Match } from '../Match';
import { ApplicationError } from '../ApplicationError';
import * as moment from 'moment';
import { map, evolve, always, prop } from 'ramda';
import { PermissionsMap } from '../PermissionsMap';
import { ModLogEntry } from '../ModLogEntry';

export class ApiError extends ApplicationError {}
export class NotAuthenticatedError extends ApiError {}
export class ForbiddenError extends ApiError {}
export class UnexpectedResponseError extends ApiError {}
export class BadDataError extends ApiError {}

const verifyStatus = (expected: number) => async (response: Response): Promise<Response> => {
  switch (response.status) {
    case expected:
      return response;
    case 400:
      const error = await response.text();
      throw new BadDataError(error);
    case 401:
      throw new NotAuthenticatedError();
    case 403:
      throw new ForbiddenError();
    default:
      throw new UnexpectedResponseError();
  }
};

const toJson = <T>() => (response: Response): Promise<T> => response.json();

const convertUnixToMoment = (x: string): moment.Moment => moment(x).utc();

const convertMatchTimes = (m: Match): Match => evolve<Match>({
  opens: convertUnixToMoment,
}, m);

export const fetchUpcomingMatches = (): Promise<Match[]> =>
  fetch('/api/matches')
    .then(verifyStatus(200))
    .then(toJson<Match[]>())
    .then(map(convertMatchTimes));

export const removeMatch = (id: number, reason: string, accessToken: string): Promise<void> =>
  fetch(
    `/api/matches/${id}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ reason }),
    },
  ).then(verifyStatus(204))
    .then(always(undefined));

export type CreateMatchData = {
  opens: moment.Moment;
  address: string | null;
  ip: string;
  scenarios: string[];
  tags: string[];
  teams: string;
  size: number | null;
  customStyle: string | null;
  count: number;
  content: string;
  region: string;
  location: string;
  version: string;
  slots: number;
  length: number;
  mapSizeX: number;
  mapSizeZ: number;
  pvpEnabledAt: number;
};

export const createMatch = (data: CreateMatchData, accessToken: string): Promise<void> =>
  fetch(
    '/api/matches',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    },
  ).then(verifyStatus(201))
    .then(always(undefined));

export type RefreshTokenResponse = {
  readonly accessToken: string;
  readonly refreshToken: string;
};

export const refreshTokens = (refreshToken: String): Promise<RefreshTokenResponse> =>
  fetch(
    '/authenticate/refresh',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${refreshToken}`,
      },
    },
  ).then(verifyStatus(200))
    .then(toJson<RefreshTokenResponse>());

export const fetchPermissions = (): Promise<PermissionsMap> =>
  fetch('/api/permissions')
    .then(verifyStatus(200))
    .then(toJson<PermissionsMap>());

const convertModLogTimes = (m: ModLogEntry): ModLogEntry => evolve<ModLogEntry>({
  at: convertUnixToMoment,
}, m);

export const fetchModLog = (): Promise<ModLogEntry[]> =>
  fetch('/api/permissions/log')
    .then(verifyStatus(200))
    .then(toJson<ModLogEntry[]>())
    .then(map(convertModLogTimes));

export const addPermission = (permission: string, username: string, accessToken: string): Promise<void> =>
  fetch(
    `/api/permissions/${username}/${permission}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  ).then(verifyStatus(201))
    .then(always(undefined));

export const removePermission = (permission: string, username: string, accessToken: string): Promise<void> =>
  fetch(
    `/api/permissions/${username}/${permission}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  ).then(verifyStatus(204))
    .then(always(undefined));

export const getApiKey = (accessToken: string): Promise<string | null> =>
  fetch(
    `/api/key`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  ).then(verifyStatus(200))
    .then(toJson<{ readonly key: string | null }>())
    .then(prop('key'));

export const regenerateApiKey = (accessToken: string): Promise<string> =>
  fetch(
    `/api/key`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  ).then(verifyStatus(200))
    .then(toJson<{ readonly key: string }>())
    .then(prop('key'));

export const getPotentialConflicts = (region: string, time: moment.Moment): Promise<Match[]> =>
  fetch(`/api/matches/conflicts/${region}/${time.format()}`)
    .then(verifyStatus(200))
    .then(toJson<Match[]>())
    .then(map(convertMatchTimes));

