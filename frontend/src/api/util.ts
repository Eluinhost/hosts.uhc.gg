import { BadDataError, ForbiddenError, NotAuthenticatedError, NotFoundError, UnexpectedResponseError } from './Errors';
import { contains, always } from 'ramda';

export const verifyStatus = (expected: number[] | number = 200) => async (response: Response): Promise<Response> => {
  if (contains(response.status, Array.isArray(expected) ? expected : [expected])) return response;

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

export const authHeaders = (accessToken: string) => ({
  Authorization: `Bearer ${accessToken}`,
});

export type ApiCallParams = {
  readonly url: RequestInfo;
  readonly status?: number[] | number;
  readonly config?: RequestInit;
};

export const fetchObject = <T>(options: ApiCallParams): Promise<T> =>
  fetch(options.url, options.config).then(verifyStatus(options.status)).then(toJson<T>());

export const maybeFetchObject = <T>(options: ApiCallParams): Promise<T | null> =>
  fetchObject<T>(options).catch(err => {
    if (err instanceof NotFoundError) return null;

    throw err;
  });

export const fetchArray = <T>(options: ApiCallParams): Promise<T[]> =>
  fetch(options.url, options.config).then(verifyStatus(options.status)).then(toJson<T[]>());

export const callApi = (options: ApiCallParams): Promise<void> =>
  fetch(options.url, options.config).then(verifyStatus(options.status)).then(always(undefined));
