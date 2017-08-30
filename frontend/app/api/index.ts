import { Match } from '../Match';
import { ApplicationError } from '../ApplicationError';
import * as moment from 'moment';
import { map, evolve, always, prop, Obj } from 'ramda';
import { PermissionsMap } from '../PermissionsMap';
import { ModLogEntry } from '../ModLogEntry';
import { HostingRules } from '../state/HostingRulesState';
import { BanEntry } from '../BanEntry';
import { BanData } from '../components/ubl/BanDataForm';

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
  created: convertUnixToMoment,
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

export const approveMatch = (id: number, accessToken: string): Promise<void> =>
  fetch(
    `/api/matches/${id}/approve`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  ).then(verifyStatus(200))
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
  mapSize: number;
  pvpEnabledAt: number;
  hostingName: string | null;
  tournament: boolean;
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

const convertHostingRules = (r: HostingRules): HostingRules => evolve<HostingRules>({
  modified: convertUnixToMoment,
}, r);

export const getHostingRules = (): Promise<HostingRules> =>
  fetch('/api/rules')
    .then(verifyStatus(200))
    .then(toJson<HostingRules>())
    .then(convertHostingRules);

export const setHostingRules = (content: string, accessToken: string): Promise<void> =>
  fetch(
    '/api/rules',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(content),
    },
  ).then(verifyStatus(201))
    .then(_ => undefined);


export const getHostingHistory = (host: string, before?: number): Promise<Match[]> =>
  fetch(`/api/hosts/${host}/matches?before=${before || ''}`)
  .then(verifyStatus(200))
  .then(toJson<Match[]>())
  .then(map(convertMatchTimes));

export const searchBannedUsernames = (query: string): Promise<Obj<string[]>> =>
  fetch(
    `/api/ubl/search/${query}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
    .then(verifyStatus(200))
    .then(toJson<Obj<string[]>>());

const convertBanTimes = (b: BanEntry): BanEntry => evolve<BanEntry>({
  expires: convertUnixToMoment,
  created: convertUnixToMoment,
}, b);

export const getAllBansForUuid = (uuid: string): Promise<BanEntry[]> =>
  fetch(`/api/ubl/${uuid}`)
    .then(verifyStatus(200))
    .then(toJson<BanEntry[]>())
    .then(map(convertBanTimes));

export const getAllCurrentBans = (): Promise<BanEntry[]> =>
  fetch(`/api/ubl/current`)
    .then(verifyStatus(200))
    .then(toJson<BanEntry[]>())
    .then(map(convertBanTimes));

export const deleteBan = (id: number, accessToken: string): Promise<void> =>
  fetch(
    `/api/ubl/${id}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    },
  ).then(verifyStatus(204)).then(always(undefined));

export const createBan = (data: BanData, accessToken: string): Promise<void> =>
  fetch(
    `/api/ubl`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    },
  ).then(verifyStatus(201)).then(always(undefined));

export const editBan = (id: number, data: BanData, accessToken: string): Promise<void> =>
  fetch(
    `/api/ubl/${id}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    },
  ).then(verifyStatus(200)).then(always(undefined));
