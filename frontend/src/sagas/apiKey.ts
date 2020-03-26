import { SagaIterator } from 'redux-saga';
import { put, call, select, all, takeLatest  } from 'redux-saga/effects';
import { getAccessToken } from '../state/Selectors';
import { FetchApiKey, RegenerateApiKey } from '../actions';
import { ApiErrors, AuthenticationApi } from '../api';
import { Action } from 'redux-actions';

function* fetchApiKeySaga(): SagaIterator {
  const accessToken: string | null = yield select(getAccessToken);

  yield put(FetchApiKey.started());

  try {
    if (!accessToken) throw new ApiErrors.NotAuthenticatedError();

    const result: string | null = yield call(AuthenticationApi.fetchApiKey, accessToken);

    yield put(FetchApiKey.success({ result }));
  } catch (error) {
    console.error('Failed to get api key');
    yield put(FetchApiKey.failure({ error }));
  }
}

function* regenerateApiKeySaga(): SagaIterator {
  const accessToken: string | null = yield select(getAccessToken);

  yield put(RegenerateApiKey.started());

  try {
    if (!accessToken) throw new ApiErrors.NotAuthenticatedError();

    const result: string = yield call(AuthenticationApi.callRegenerateApiKey, accessToken);

    yield put(RegenerateApiKey.success({ result }));
  } catch (error) {
    console.error('Failed to regenerate api key');
    yield put(RegenerateApiKey.failure({ error }));
  }
}

export function* watchApiKey(): SagaIterator {
  yield all([
    takeLatest<Action<void>>(FetchApiKey.start, fetchApiKeySaga),
    takeLatest<Action<void>>(RegenerateApiKey.start, regenerateApiKeySaga),
  ]);
}
