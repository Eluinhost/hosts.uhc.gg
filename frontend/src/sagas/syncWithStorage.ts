import localForage from 'localforage';
import type { SagaIterator } from 'redux-saga';
import { put, call, spawn, takeLatest, takeEvery, all } from 'redux-saga/effects';

import { ClearStorage, SetSavedHostFormData } from '../actions';
import type { CreateMatchData } from '../models/CreateMatchData';
import { wrapError } from '../utils/wrapError';

export const storage: LocalForage = localForage.createInstance({
  name: 'hosts-uhcgg-data',
  version: 1.0,
  storeName: 'hosts-uhcgg-data',
  description: 'Serialized data to carry settings across refreshes',
});

const baseKey = `settings`;

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

function* syncHostFormData(): SagaIterator {
  const key = `${baseKey}.host-form-data`;

  const stored: CreateMatchData | null = yield call(storage.getItem.bind(storage), key);

  if (stored !== null) {
    yield put(SetSavedHostFormData.started({ parameters: stored }));
  }

  yield spawn(function* (): SagaIterator {
    yield takeLatest(
      SetSavedHostFormData.start,
      function* (action: ReturnType<typeof SetSavedHostFormData.start>): SagaIterator {
        const parameters = action.payload;

        yield put(SetSavedHostFormData.started({ parameters }));

        try {
          yield call(storage.setItem.bind(storage), key, { ...parameters, opens: undefined });
          yield put(SetSavedHostFormData.success({ parameters }));
        } catch (error) {
          console.error(error, 'failed to save host form data');
          yield put(SetSavedHostFormData.failure({ parameters, error: wrapError(error) }));
        }
      },
    );
  });
}

// This saga needs to complete, once it is done the first render will happen
export function* syncWithStorage(): SagaIterator {
  yield all([call(syncHostFormData), spawn(watchClearStorage)]);
}
