import { getDefaultStore } from 'jotai';
import ky from 'ky';
import type { Input, Options } from 'ky';

import { accessTokenAtom } from './atoms/authentication';

const store = getDefaultStore();

const client = ky.create({
  hooks: {
    beforeRequest: [
      ({ request }) => {
        request.headers.set('Authorization', `Bearer ${store.get(accessTokenAtom)}`);
      },
    ],
  },
});

// modifying types so that `signal` must be explicitly passed (or null), helps prevent forgetting passing signal
type WithSignal = Omit<Options, 'signal'> & { signal: AbortSignal | null };

export const apiClient = {
  delete: <T = unknown>(input: Input, options: WithSignal) => client.delete<T>(input, options),
  get: <T = unknown>(input: Input, options: WithSignal) => client.get<T>(input, options),
  patch: <T = unknown>(input: Input, options: WithSignal) => client.patch<T>(input, options),
  post: <T = unknown>(input: Input, options: WithSignal) => client.post<T>(input, options),
  put: <T = unknown>(input: Input, options: WithSignal) => client.put<T>(input, options),
};
