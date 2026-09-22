import { getDefaultStore } from 'jotai';
import type { SagaIterator } from 'redux-saga';
import { put, call, all, takeLatest } from 'redux-saga/effects';

import { FetchApiKey, RegenerateApiKey } from '../actions';
import { ApiErrors, AuthenticationApi } from '../api';
import { accessTokenAtom } from '../atoms/authentication';
import { wrapError } from '../utils/wrapError';

const store = getDefaultStore();

function* fetchApiKeySaga(): SagaIterator {
  const accessToken = store.get(accessTokenAtom);

  yield put(FetchApiKey.started());

  try {
    if (!accessToken) throw new ApiErrors.NotAuthenticatedError();

    const result: string | null = yield call(AuthenticationApi.fetchApiKey, accessToken);

    yield put(FetchApiKey.success({ result }));
  } catch (error) {
    console.error('Failed to get api key');
    yield put(FetchApiKey.failure({ error: wrapError(error) }));
  }
}

function* regenerateApiKeySaga(): SagaIterator {
  const accessToken = store.get(accessTokenAtom);

  yield put(RegenerateApiKey.started());

  try {
    if (!accessToken) throw new ApiErrors.NotAuthenticatedError();

    const result: string = yield call(AuthenticationApi.callRegenerateApiKey, accessToken);

    yield put(RegenerateApiKey.success({ result }));
  } catch (error) {
    console.error('Failed to regenerate api key');
    yield put(RegenerateApiKey.failure({ error: wrapError(error) }));
  }
}

export function* watchApiKey(): SagaIterator {
  yield all([takeLatest(FetchApiKey.start, fetchApiKeySaga), takeLatest(RegenerateApiKey.start, regenerateApiKeySaga)]);
}
