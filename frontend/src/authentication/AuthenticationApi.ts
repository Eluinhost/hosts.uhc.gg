import { queryOptions } from '@tanstack/react-query';
import { getDefaultStore } from 'jotai';
import { HTTPError } from 'ky';
import * as v from 'valibot';

import { apiClient } from '@/apiClient';
import {
  accessTokenClaimsAtom,
  authenticationAtom,
  refreshTokenClaimsAtom,
} from '@/authentication/atoms/authentication';
import dayjs from '@/dayjs';

const tokensSchema = v.object({
  accessToken: v.string(),
  refreshToken: v.string(),
});

const MAX_RETRY_DELAY_MS = 10_000;
const REFRESH_TOKEN_WINDOW_MINUTES = 5;
const ACCESS_TOKEN_WINDOW_MINUTES = 10;

const isRejectedRefresh = (error: unknown): error is HTTPError =>
  error instanceof HTTPError && [400, 401, 403].includes(error.response.status);

const store = getDefaultStore();

export const AuthenticationApi = {
  autoRefresh: queryOptions({
    queryKey: ['authentication', 'refresh'],
    queryFn: async ({ signal }): Promise<{ accessToken: string; refreshToken: string } | null> => {
      const previous = store.get(authenticationAtom);

      console.log('Checking authentication token refresh status');

      if (!previous) {
        console.log('Not logged in');
        return null;
      }

      const now = dayjs.utc();

      // If the access token still has enough time left, do nothing
      if (store.get(accessTokenClaimsAtom)?.expires.isAfter(now.add(ACCESS_TOKEN_WINDOW_MINUTES, 'minutes'))) {
        console.log('Authentication token not stale');
        return previous;
      }

      const refreshClaims = store.get(refreshTokenClaimsAtom);

      // If the refresh token has expired too (or close to), just log the client out
      if (!refreshClaims || refreshClaims.expires.isBefore(now.add(REFRESH_TOKEN_WINDOW_MINUTES, 'minutes'))) {
        console.log('Authentication + Refresh token stale, logging out');
        store.set(authenticationAtom, null);
        return null;
      }

      try {
        // refresh token must not be null here as refreshClaims worked
        const data = await apiClient
          .post('/authenticate/refresh', {
            headers: {
              Authorization: `Bearer ${previous.refreshToken}`,
            },
            signal,
          })
          .json(tokensSchema);

        store.set(authenticationAtom, data);

        console.log('Authentication tokens refreshed');

        return data;
      } catch (err) {
        console.error(err, 'error refreshing tokens');

        if (isRejectedRefresh(err)) {
          console.log('Refresh token rejected, logging out');
          store.set(authenticationAtom, null);
        }

        // rethrow for react-query to take over and retry
        throw err;
      }
    },
    retry: (attempt, error) => attempt < 8 && !isRejectedRefresh(error),
    // first 3 attempts are immediate, followed by exponential backoff, 1000 * 2^n: 1000, 2000, 4000, 8000 e.t.c.
    retryDelay: attempt => Math.min(attempt < 3 ? 0 : 1000 * 2 ** (attempt - 3), MAX_RETRY_DELAY_MS),
    refetchInterval: 60_000,
    refetchIntervalInBackground: true,
  }),
};
