import type { ExtractAtomValue } from 'jotai';

import type { authenticationAtom } from '../atoms/authentication';

import { authHeaders, fetchObject } from './util';

export const callRefreshTokens = (refreshToken: string): Promise<ExtractAtomValue<typeof authenticationAtom>> =>
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
