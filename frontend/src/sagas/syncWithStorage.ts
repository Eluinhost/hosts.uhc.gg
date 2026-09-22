import localForage from 'localforage';
import type { SagaIterator } from 'redux-saga';
import { put, call, spawn, takeEvery, all } from 'redux-saga/effects';

import { ClearStorage } from '../actions';
import { wrapError } from '../utils/wrapError';

export const storage: LocalForage = localForage.createInstance({
  name: 'hosts-uhcgg-data',
  version: 1.0,
  storeName: 'hosts-uhcgg-data',
  description: 'Serialized data to carry settings across refreshes',
});

function* watchClearStorage(): SagaIterator {
  yield takeEvery(ClearStorage.start, function* (): SagaIterator {
    yield put(ClearStorage.started());

    try {
      yield call(storage.clear.bind(storage));
      yield put(ClearStorage.success());
      yield call(window.location.reload.bind(window.location));
    } catch (error) {
      console.error(error, 'failed to clear storage');
      yield put(ClearStorage.failure({ error: wrapError(error) }));
    }
  });
}

// This saga needs to complete, once it is done the first render will happen
export function* syncWithStorage(): SagaIterator {
  yield all([spawn(watchClearStorage)]);
}
