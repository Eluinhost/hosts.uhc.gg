import { type ExtractAtomValue, getDefaultStore } from 'jotai';
import type { SagaIterator } from 'redux-saga';
import { call, delay, fork, spawn } from 'redux-saga/effects';

import { ApiErrors, AuthenticationApi } from '../api';
import {
  accessTokenAtom,
  accessTokenClaimsAtom,
  authenticationAtom,
  isLoggedInAtom,
  refreshTokenClaimsAtom,
} from '../atoms/authentication';
import dayjs from '../dayjs';

const store = getDefaultStore();

export type LoginPayload = ExtractAtomValue<typeof authenticationAtom>;

function* attemptRefresh(): SagaIterator {
  console.log('Checking authentication token refresh status');

  if (!store.get(isLoggedInAtom)) {
    console.log('Not logged in');
    return;
  }

  const now = dayjs.utc();

  // If the access token still has time left do nothing
  if (store.get(accessTokenClaimsAtom)?.expires.isAfter(now.add(5, 'minutes'))) {
    console.log('Authentication token not stale');
    return;
  }

  const refreshClaims = store.get(refreshTokenClaimsAtom);

  // If the refresh token has expired too just log the client out
  if (!refreshClaims || refreshClaims.expires.isBefore(now.subtract(5, 'minutes'))) {
    console.log('Authentication + Refresh token stale, logging out');
    store.set(authenticationAtom, null);
    return;
  }

  try {
    // refresh token mustn't be null here as refreshClaims worked
    const data: LoginPayload = yield call(
      AuthenticationApi.callRefreshTokens,
      store.get(accessTokenAtom) || 'ERROR NO REFRESH TOKEN IN STATE',
    );

    store.set(authenticationAtom, data);

    console.log('Authentication tokens refreshed');
  } catch (err) {
    console.error(err, 'error refreshing tokens');

    // force log them out if refresh token is broken
    if (err instanceof ApiErrors.ForbiddenError || err instanceof ApiErrors.NotAuthenticatedError) {
      store.set(authenticationAtom, null);
    }
  }
}

export function* authentication(): SagaIterator {
  // check every minute if we need to refresh our authentication tokens
  yield spawn(function* (): SagaIterator {
    // safe to loop as we have a delay and intended to run infinite
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    while (true) {
      yield fork(attemptRefresh);
      yield delay(60000);
    }
  });
}
