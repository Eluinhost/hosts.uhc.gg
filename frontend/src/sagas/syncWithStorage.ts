import localForage from 'localforage';
import type { SagaIterator } from 'redux-saga';
import { put, call, spawn, takeLatest, takeEvery, all } from 'redux-saga/effects';
import type { ActionCreator } from 'typesafe-redux-helpers';

import { ClearStorage, Presets, SetSavedHostFormData } from '../actions';
import type { CreateMatchData } from '../models/CreateMatchData';
import { wrapError } from '../utils/wrapError';

export const storage: LocalForage = localForage.createInstance({
  name: 'hosts-uhcgg-data',
  version: 1.0,
  storeName: 'hosts-uhcgg-data',
  description: 'Serialized data to carry settings across refreshes',
});

const baseKey = `settings`;

// TODO does this only work with strings?
const saveAndListen = <Data>(setAction: ActionCreator<Data, Data, string>, storageKey: string) =>
  function* (): SagaIterator {
    const key = `${baseKey}.${storageKey}`;

    const stored: Data = yield call(storage.getItem.bind(storage), key);

    if (stored !== null) {
      yield put(setAction(stored));
    }

    // start a separate task to listen for changes to save them
    yield spawn(function* (): SagaIterator {
      yield takeLatest(setAction, function* (action): SagaIterator {
        yield call(storage.setItem.bind(storage), key, action.payload);
      });
    });
  };

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
  yield all([call(saveAndListen(Presets.save, 'presets')), call(syncHostFormData), spawn(watchClearStorage)]);
}
