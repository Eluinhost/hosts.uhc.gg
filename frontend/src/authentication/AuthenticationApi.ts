import { queryOptions, useMutation } from '@tanstack/react-query';
import { getDefaultStore } from 'jotai';
import { HTTPError } from 'ky';
import * as v from 'valibot';

import { apiClient } from '@/apiClient';
import { sessionAtom, type SessionClaims } from '@/authentication/atoms/authentication';

const MAX_RETRY_DELAY_MS = 10_000;
const SESSION_POLL_MS = 300_000;

const store = getDefaultStore();

const sessionSchema = v.object({
  username: v.string(),
  permissions: v.array(v.string()),
});

const isRejectedSession = (error: unknown): error is HTTPError =>
  error instanceof HTTPError && [401, 403].includes(error.response.status);

export const AuthenticationApi = {
  session: queryOptions({
    queryKey: ['session'],
    queryFn: async ({ signal }): Promise<SessionClaims | null> => {
      const previous = store.get(sessionAtom);

      try {
        const claims = await apiClient.get('/api/me', { signal }).json(sessionSchema);

        store.set(sessionAtom, claims);
        return claims;
      } catch (error) {
        if (signal.aborted) {
          return previous;
        }

        if (isRejectedSession(error)) {
          console.log('session rejected, logging out', error);

          store.set(sessionAtom, null);
          return null;
        }

        console.log('session lookup failed: other', error);

        throw error;
      }
    },
    retry: (attempt, error) => attempt < 8 && !isRejectedSession(error),
    // first 3 attempts are immediate, followed by exponential backoff, 1000 * 2^n: 1000, 2000, 4000, 8000 e.t.c.
    retryDelay: attempt => Math.min(attempt < 3 ? 0 : 1000 * 2 ** (attempt - 3), MAX_RETRY_DELAY_MS),
    refetchInterval: SESSION_POLL_MS,
  }),

  mutations: {
    useLogout: () =>
      useMutation({
        mutationFn: () => apiClient.post('/authenticate/logout', { signal: null }),
        onSettled: () => {
          store.set(sessionAtom, null);
        },
      }),
  },
};
