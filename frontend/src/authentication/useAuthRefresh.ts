import { queryOptions, useQuery } from '@tanstack/react-query';
import { getDefaultStore, useAtomValue } from 'jotai';
import { HTTPError } from 'ky';
import { enforce } from 'vest';

import { apiClient } from '../apiClient';
import {
  accessTokenClaimsAtom,
  authenticationAtom,
  isLoggedInAtom,
  refreshTokenClaimsAtom,
} from '../atoms/authentication';
import dayjs from '../dayjs';

const store = getDefaultStore();

const tokensSchema = enforce.shape({
  accessToken: enforce.isString(),
  refreshToken: enforce.isString(),
});

export const useAuthRefresh = () => {
  const isLoggedIn = useAtomValue(isLoggedInAtom);

  return useQuery(
    queryOptions({
      enabled: isLoggedIn,
      initialData: () => store.get(authenticationAtom),
      queryKey: ['authentication', 'refresh'],
      queryFn: async (): Promise<{ accessToken: string; refreshToken: string } | null> => {
        const previous = store.get(authenticationAtom);

        console.log('Checking authentication token refresh status');

        if (!previous) {
          console.log('Not logged in');
          return previous;
        }

        const now = dayjs.utc();

        // If the access token still has time left do nothing
        if (store.get(accessTokenClaimsAtom)?.expires.isAfter(now.add(5, 'minutes'))) {
          console.log('Authentication token not stale');
          return previous;
        }

        const refreshClaims = store.get(refreshTokenClaimsAtom);

        // If the refresh token has expired too just log the client out
        if (!refreshClaims || refreshClaims.expires.isBefore(now.subtract(5, 'minutes'))) {
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
            })
            .json(enforce.anyOf(enforce.isNull(), tokensSchema));

          store.set(authenticationAtom, data);

          console.log('Authentication tokens refreshed');

          return data;
        } catch (err) {
          console.error(err, 'error refreshing tokens');

          // force log them out if refresh token is broken
          if (err instanceof HTTPError && (err.response.status === 401 || err.response.status === 403)) {
            store.set(authenticationAtom, null);
          }

          // rethrow for react-query to take over and retry
          throw err;
        }
      },
      refetchInterval: 60_000,
      refetchIntervalInBackground: true,
    }),
  );
};
