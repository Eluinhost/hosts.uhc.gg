import type { SagaIterator } from 'redux-saga';
import { takeLatest, put, call } from 'redux-saga/effects';

import { FETCH_VERSIONS } from './actions';
import { getAllVersions } from './api';

export class FetchVersionsError extends Error {
  constructor(public cause: unknown) {
    super(`Failed to lookup versions, caused by:\n ${cause instanceof Error ? cause.message : String(cause)}`);
  }
}

function* fetchVersionsSaga(): SagaIterator {
  yield put(FETCH_VERSIONS.STARTED());

  try {
    const versions: Array<string> = yield call(getAllVersions);

    yield put(FETCH_VERSIONS.COMPLETED(versions));
  } catch (err) {
    const error = new FetchVersionsError(err);
    console.error(error);
    yield put(FETCH_VERSIONS.COMPLETED.failed(error));
  }
}

export function* listenForVersionActions(): SagaIterator {
  yield takeLatest(FETCH_VERSIONS.TRIGGER, fetchVersionsSaga);
}
