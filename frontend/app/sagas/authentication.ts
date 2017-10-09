import { SagaIterator, effects, delay } from 'redux-saga';
import { Authentication, LoginPayload } from '../actions';
import { Action } from 'redux-actions';
import { storage } from '../storage';
import { getAccessTokenClaims, getRefreshTokenClaims, isLoggedIn } from '../state/Selectors';
import { ApiErrors, AuthenticationApi } from '../api';
import * as moment from 'moment-timezone';
import { ApplicationState } from '../state/ApplicationState';

const setTokens = (login: LoginPayload, storageKey: string): Promise<void> =>
  Promise.resolve()
    .then(() => storage.setItem(`${storageKey}.accessToken`, login.accessToken))
    .then(() => storage.setItem(`${storageKey}.refreshToken`, login.refreshToken))
    .then(() => {});

const clearTokens = (storageKey: string): Promise<void> =>
  Promise.resolve()
    .then(() => storage.removeItem(`${storageKey}.accessToken`))
    .then(() => storage.removeItem(`${storageKey}.refreshToken`))
    .then(() => {});

function* saveTokensSaga(action: Action<LoginPayload>): SagaIterator {
  const storageKey: string = yield effects.select((state: ApplicationState) => state.authentication.storageKey);

  yield effects.call(setTokens, action.payload!, storageKey);
}

function* clearTokensSaga(): SagaIterator {
  const storageKey: string = yield effects.select((state: ApplicationState) => state.authentication.storageKey);

  yield effects.call(clearTokens, storageKey);
}

function* attemptRefresh(): SagaIterator {
  const state: ApplicationState = yield effects.select();

  console.log('Checking authentication token refresh status');

  if (!isLoggedIn(state)) {
    console.log('Not logged in');
    return;
  }

  const now = moment();

  // If the access token still has time left do nothing
  if (getAccessTokenClaims(state)!.expires.isAfter(now.add(5 , 'minutes'))) {
    console.log('Authentication token not stale');
    return;
  }

  const refreshClaims = getRefreshTokenClaims(state);

  // If the refresh token has expired too just log the client out
  if (!refreshClaims || refreshClaims.expires.isBefore(now.subtract(5, 'minutes'))) {
    console.log('Authentication + Refresh token stale, logging out');
    yield effects.put(Authentication.logout());
    return;
  }

  try {
    // refresh token mustn't be null here as refreshClaims worked
    const data: LoginPayload = yield effects.call(
      AuthenticationApi.callRefreshTokens,
      (state.authentication.refreshToken || 'ERROR NO REFRESH TOKEN IN STATE'),
    );

    yield effects.put(Authentication.login(data));

    console.log('Authentication tokens refreshed');
  } catch (err) {
    console.error(err, 'error refreshing tokens');

    // force log them out if refresh token is broken
    if (err instanceof ApiErrors.ForbiddenError || err instanceof ApiErrors.NotAuthenticatedError) {
      yield effects.put(Authentication.logout());
    }
  }
}

export function* autoAttemptRefreshTokens(): SagaIterator {
  // check every minute if we need to refresh our authentication tokens
  while (true) {
    yield effects.call(delay, 60000);
    yield effects.put(Authentication.attemptRefresh());
  }
}

export function* watchAuthentication(): SagaIterator {
  yield effects.all([
    effects.fork(autoAttemptRefreshTokens),
    effects.takeEvery<Action<LoginPayload>>(Authentication.login, saveTokensSaga),
    effects.takeEvery<Action<void>>(Authentication.logout, clearTokensSaga),
    effects.takeEvery(Authentication.attemptRefresh, attemptRefresh),
  ]);
}
