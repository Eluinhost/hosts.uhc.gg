import { SagaIterator } from 'redux-saga';
import { select, put, takeEvery, call } from 'redux-saga/effects';
import { Authentication, LoginPayload } from '../actions';
import { getAccessTokenClaims, getRefreshTokenClaims, isLoggedIn } from '../state/Selectors';
import { ApiErrors, AuthenticationApi } from '../api';
import moment from 'moment-timezone';
import { ApplicationState } from '../state/ApplicationState';

function* attemptRefresh(): SagaIterator {
  const state: ApplicationState = yield select();

  console.log('Checking authentication token refresh status');

  if (!isLoggedIn(state)) {
    console.log('Not logged in');
    return;
  }

  const now = moment();

  // If the access token still has time left do nothing
  if (getAccessTokenClaims(state)!.expires.isAfter(now.add(5, 'minutes'))) {
    console.log('Authentication token not stale');
    return;
  }

  const refreshClaims = getRefreshTokenClaims(state);

  // If the refresh token has expired too just log the client out
  if (!refreshClaims || refreshClaims.expires.isBefore(now.subtract(5, 'minutes'))) {
    console.log('Authentication + Refresh token stale, logging out');
    yield put(Authentication.logout());
    return;
  }

  try {
    // refresh token mustn't be null here as refreshClaims worked
    const data: LoginPayload = yield call(
      AuthenticationApi.callRefreshTokens,
      state.authentication.refreshToken || 'ERROR NO REFRESH TOKEN IN STATE',
    );

    yield put(Authentication.login(data));

    console.log('Authentication tokens refreshed');
  } catch (err) {
    console.error(err, 'error refreshing tokens');

    // force log them out if refresh token is broken
    if (err instanceof ApiErrors.ForbiddenError || err instanceof ApiErrors.NotAuthenticatedError) {
      yield put(Authentication.logout());
    }
  }
}

export function* refreshAuthentication(): SagaIterator {
  yield takeEvery(Authentication.attemptRefresh, attemptRefresh);
}
