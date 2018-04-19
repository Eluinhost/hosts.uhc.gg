import { BadDataError, ForbiddenError, NotAuthenticatedError, NotFoundError, UnexpectedResponseError } from './Errors';
import { contains, map, always } from 'ramda';
import { isArray } from 'util';
import * as moment from 'moment-timezone';

export const verifyStatus = (expected: number[] | number = 200) => async (response: Response): Promise<Response> => {
  if (contains(response.status, isArray(expected) ? expected : [expected])) return response;

  switch (response.status) {
    case 400:
      const error = await response.text();
      throw new BadDataError(error);
    case 401:
      throw new NotAuthenticatedError();
    case 403:
      throw new ForbiddenError();
    default:
      throw new UnexpectedResponseError(response.status);
  }
};

// simple function to get JSON, assumes return type is correct
export const toJson = <T>() => (response: Response): Promise<T> => response.json();

export const convertUnixToMoment = (x: string) => moment(x).utc();

export const mapMomentProps = <T extends Object>(props: (keyof T)[]) => (t: T): T =>
  props.reduce((obj, prop) => Object.assign({}, obj, { [prop]: convertUnixToMoment(t[prop]) }), t);

export const authHeaders = (accessToken: string) => ({
  Authorization: `Bearer ${accessToken}`,
});

export type ApiCallParams = {
  readonly url: RequestInfo;
  readonly status?: number[] | number;
  readonly config?: RequestInit;
};

export type FetchApiCallParams<T> = ApiCallParams & {
  readonly momentProps?: [keyof T];
};

export const fetchObject = <T>(options: FetchApiCallParams<T>): Promise<T> =>
  fetch(options.url, options.config)
    .then(verifyStatus(options.status))
    .then(toJson<T>())
    .then(mapMomentProps<T>(options.momentProps || []));

export const maybeFetchObject = <T>(options: FetchApiCallParams<T>): Promise<T | null> =>
  fetchObject(options).catch(err => {
    if (err instanceof NotFoundError) return null;

    throw err;
  });

export const fetchArray = <T>(options: FetchApiCallParams<T>): Promise<T[]> =>
  fetch(options.url, options.config)
    .then(verifyStatus(options.status))
    .then(toJson<T[]>())
    .then(map(mapMomentProps<T>(options.momentProps || [])));

export const callApi = (options: ApiCallParams): Promise<void> =>
  fetch(options.url, options.config)
    .then(verifyStatus(options.status))
    .then(always(undefined));
