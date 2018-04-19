import { delay, effects, SagaIterator } from 'redux-saga';
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

function* genericSaveAndListen<T>(setAction: ActionFunction1<T, Action<T>>, storageKey: string) {
  const key = `${baseKey}.${storageKey}`;

  const stored: T | null = yield effects.call([storage, storage.getItem], key);

  if (stored !== null) {
    yield effects.put(setAction(stored));
  }

  // start a separate task to listen for changes to save them
  yield effects.spawn(function*(): SagaIterator {
    yield effects.takeLatest(setAction, function*(action: Action<T>): SagaIterator {
      yield effects.call([storage, storage.setItem], key, action.payload);
    });
  });
}

function* watchLogout(): SagaIterator {
  yield effects.takeEvery(Authentication.logout, function*(): SagaIterator {
    yield effects.call([storage, storage.removeItem], `${baseKey}.authentication`);
  });
}

function* watchClearStorage(): SagaIterator {
  yield effects.takeEvery(ClearStorage.start, function*(): SagaIterator {
    yield effects.put(ClearStorage.started());

    try {
      yield effects.call([storage, storage.clear]);
      yield effects.put(ClearStorage.success());
      yield effects.call(window.location.reload, true);
    } catch (error) {
      console.error(error, 'failed to clear storage');
      yield effects.put(ClearStorage.failure({ error }));
    }
  });
}

function* syncHostFormData(): SagaIterator {
  const key = `${baseKey}.host-form-data`;

  const stored: CreateMatchData | null = yield effects.call([storage, storage.getItem], key);

  if (stored !== null) {
    yield effects.put(SetSavedHostFormData.started({ parameters: stored }));
  }

  yield effects.spawn(function*(): SagaIterator {
    yield effects.takeLatest(SetSavedHostFormData.start, function*(action: Action<CreateMatchData>): SagaIterator {
      const parameters = action.payload!;

      yield effects.put(SetSavedHostFormData.started({ parameters }));

      try {
        yield effects.call([storage, storage.setItem], key, { ...parameters, opens: undefined });
        yield effects.put(SetSavedHostFormData.success({ parameters }));
      } catch (error) {
        console.error(error, 'failed to save host form data');
        yield effects.put(SetSavedHostFormData.failure({ parameters, error }));
      }
    });
  });
}

function* authentication(): SagaIterator {
  yield effects.call(genericSaveAndListen, Authentication.login, 'authentication');
  // check every minute if we need to refresh our authentication tokens
  yield effects.spawn(function*(): SagaIterator {
    while (true) {
      yield effects.put(Authentication.attemptRefresh());
      yield effects.call(delay, 60000);
    }
  });
}

// This saga needs to complete, once it is done the first render will happen
export function* syncWithStorage(): SagaIterator {
  yield effects.all([
    effects.call(genericSaveAndListen, Settings.setDarkMode, 'isDarkMode'),
    effects.call(genericSaveAndListen, Settings.setIs12h, 'is12h'),
    effects.call(genericSaveAndListen, Settings.setHideRemoved, 'hideRemoved'),
    effects.call(genericSaveAndListen, Settings.setShowOwnRemoved, 'showOwnRemoved'),
    effects.call(genericSaveAndListen, Settings.setTimezone, 'timezone'),
    effects.call(authentication),
    effects.call(syncHostFormData),
    effects.spawn(watchLogout), // start separately
    effects.spawn(watchClearStorage),
  ]);
}
