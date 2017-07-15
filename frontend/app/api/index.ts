import { Match } from '../Match';
import { AuthenticationState } from '../state/AuthenticationState';
import { ApplicationError } from '../ApplicationError';
import * as moment from 'moment';

export class ApiError extends ApplicationError {}
export class NotAuthenticatedError extends ApiError {}
export class ForbiddenError extends ApiError {}
export class UnexpectedResponseError extends ApiError {}
export class BadDataError extends ApiError {}

const verifyStatus = (expected: number) => function (response: Response): Promise<Response> {
  switch (response.status) {
    case expected:
      return Promise.resolve(response);
    case 400:
      return response.text().then(text => Promise.reject(new BadDataError(text)));
    case 401:
      return Promise.reject(new NotAuthenticatedError());
    case 403:
      return Promise.reject(new ForbiddenError());
    default:
      return Promise.reject(new UnexpectedResponseError());
  }
};

function toJson<T>(response: Response): Promise<T> {
  return response.json();
}

export function fetchUpcomingMatches(): Promise<Match[]> {
  return fetch('/api/matches')
    .then(verifyStatus(200))
    .then(response => toJson<Match[]>(response));
}

export function removeMatch(id: number, reason: string, authentication: AuthenticationState): Promise<void> {
  return fetch(`/api/matches/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authentication.data!.raw}`,
    },
    body: JSON.stringify({ reason }),
  }).then(verifyStatus(204)).then(_ => undefined);
}

export type CreateMatchData = {
  address?: string;
  ip: string;
  scenarios: string[];
  opens: moment.Moment;
  region: string;
  content: string;
  tags: string[];
  size: number;
  teams: string;
  customStyle?: string;
  count: number;
};

export function createMatch(data: CreateMatchData, authentication: AuthenticationState): Promise<void> {
  return fetch('/api/matches', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authentication.data!.raw}`,
    },
    body: JSON.stringify(data),
  }).then(verifyStatus(201)).then(_ => undefined);
}
