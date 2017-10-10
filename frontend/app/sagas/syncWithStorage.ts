import { effects, SagaIterator } from 'redux-saga';
import { storage } from '../services/storage';
import { Action, ActionFunction1 } from 'redux-actions';
import { Settings } from '../actions';

const baseKey = `settings`;

function* genericSaveAndListen<T>(setAction: ActionFunction1<T, Action<T>>, storageKey: string) {
  const key = `${baseKey}.${storageKey}`;

  const stored: T | null = yield effects.call([storage, storage.getItem], key);

  if (stored !== null) {
    yield effects.put(setAction(stored));
  }

  // start a separate task to listen for changes to save them
  yield effects.spawn(function* (): SagaIterator {
    yield effects.takeLatest(setAction, function* (action: Action<T>): SagaIterator {
      yield effects.call([storage, storage.setItem], key, action.payload);
    });
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
  ]);
}
