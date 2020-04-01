import { SagaIterator } from 'redux-saga';
import { delay, put, call, spawn, takeLatest, takeEvery, all } from 'redux-saga/effects';
import { Action, ActionFunction1 } from 'redux-actions';
import { Authentication, ClearStorage, SetSavedHostFormData, Settings } from '../actions';
import * as localForage from 'localforage';
import { CreateMatchData } from '../models/CreateMatchData';

export const storage: LocalForage = localForage.createInstance({
  name: 'hosts-uhcgg-data',
  version: 1.0,
  storeName: 'hosts-uhcgg-data',
  description: 'Serialized data to carry settings across refreshes',
});

const baseKey = `settings`;

function* saveAndListen(setAction: ActionFunction1<any, Action<any>>, storageKey: string): SagaIterator {
  const key = `${baseKey}.${storageKey}`;

  const stored: any = yield call({ context: storage, fn: storage.getItem }, key);

  if (stored !== null) {
    yield put(setAction(stored));
  }

  // start a separate task to listen for changes to save them
  yield spawn(function* (): SagaIterator {
    yield takeLatest(setAction, function* (action: Action<any>): SagaIterator {
      yield call([storage, storage.setItem], key, action.payload);
    });
  });
}

function* watchLogout(): SagaIterator {
  yield takeEvery(Authentication.logout, function* (): SagaIterator {
    yield call([storage, storage.removeItem], `${baseKey}.authentication`);
  });
}

function* watchClearStorage(): SagaIterator {
  yield takeEvery(ClearStorage.start, function* (): SagaIterator {
    yield put(ClearStorage.started());

    try {
      yield call([storage, storage.clear]);
      yield put(ClearStorage.success());
      yield call(window.location.reload, true);
    } catch (error) {
      console.error(error, 'failed to clear storage');
      yield put(ClearStorage.failure({ error }));
    }
  });
}

function* syncHostFormData(): SagaIterator {
  const key = `${baseKey}.host-form-data`;

  const stored: CreateMatchData | null = yield call([storage, storage.getItem], key);

  if (stored !== null) {
    yield put(SetSavedHostFormData.started({ parameters: stored }));
  }

  yield spawn(function* (): SagaIterator {
    yield takeLatest(SetSavedHostFormData.start, function* (action: Action<CreateMatchData>): SagaIterator {
      const parameters = action.payload!;

      yield put(SetSavedHostFormData.started({ parameters }));

      try {
        yield call([storage, storage.setItem], key, { ...parameters, opens: undefined });
        yield put(SetSavedHostFormData.success({ parameters }));
      } catch (error) {
        console.error(error, 'failed to save host form data');
        yield put(SetSavedHostFormData.failure({ parameters, error }));
      }
    });
  });
}

function* authentication(): SagaIterator {
  yield call(saveAndListen, Authentication.login, 'authentication');
  // check every minute if we need to refresh our authentication tokens
  yield spawn(function* (): SagaIterator {
    while (true) {
      yield put(Authentication.attemptRefresh());
      yield delay(60000);
    }
  });
}

// This saga needs to complete, once it is done the first render will happen
export function* syncWithStorage(): SagaIterator {
  yield all([
    call(saveAndListen, Settings.setDarkMode, 'isDarkMode'),
    call(saveAndListen, Settings.setIs12h, 'is12h'),
    call(saveAndListen, Settings.setHideRemoved, 'hideRemoved'),
    call(saveAndListen, Settings.setShowOwnRemoved, 'showOwnRemoved'),
    call(saveAndListen, Settings.setTimezone, 'timezone'),
    call(authentication),
    call(syncHostFormData),
    spawn(watchLogout), // start separately
    spawn(watchClearStorage),
  ]);
}
