import { LoginPayload } from '../actions';
import { authHeaders, fetchObject } from './util';

export const callRefreshTokens = (refreshToken: string): Promise<LoginPayload> =>
  fetchObject({
    url: `/authenticate/refresh`,
    config: {
      method: 'POST',
      headers: {
        ...authHeaders(refreshToken),
        'Content-Type': 'application/json',
      },
    },
  });

export const callRegenerateApiKey = (accessToken: string): Promise<string> =>
  fetchObject<{ readonly key: string }>({
    url: `/api/key`,
    config: {
      method: 'POST',
      headers: authHeaders(accessToken),
    },
  }).then(it => it.key);

export const fetchApiKey = (accessToken: string): Promise<string | null> =>
  fetchObject<{ readonly key: string | null }>({
    url: `/api/key`,
    config: {
      method: 'GET',
      headers: authHeaders(accessToken),
    },
  }).then(it => it.key);
