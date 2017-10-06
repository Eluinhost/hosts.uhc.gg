import { SagaIterator, effects } from 'redux-saga';
import { Settings } from '../actions';
import { ApplicationState } from '../state/ApplicationState';
import * as Selectors from '../state/Selectors';
import { storage } from '../storage';
import { Action } from 'redux-actions';

const getStorageKey = (state: ApplicationState): string => state.settings.storageKey;

function* saveDarkMode(action: Action<boolean>): SagaIterator {
  const storageKey: string = yield effects.select(getStorageKey);

  yield effects.call([storage, storage.setItem], `${storageKey}.isDarkMode`, action.payload!);
}

function* toggleDarkMode(): SagaIterator {
  const current: boolean = yield effects.select(Selectors.isDarkMode);

  yield effects.put(Settings.setDarkMode(!current));
}

function* saveIs12h(action: Action<boolean>): SagaIterator {
  const storageKey: string = yield effects.select(getStorageKey);

  yield effects.call([storage, storage.setItem], `${storageKey}.is12h`, action.payload!);
}

function* toggleIs12h(): SagaIterator {
  const current: boolean = yield effects.select(Selectors.is12hFormat);

  yield effects.put(Settings.setIs12h(!current));
}

function* saveHideRemoved(action: Action<boolean>): SagaIterator {
  const storageKey: string = yield effects.select(getStorageKey);

  yield effects.call([storage, storage.setItem], `${storageKey}.hideRemoved`, action.payload!);
}

function* toggleHideRemoved(): SagaIterator {
  const current: boolean = yield effects.select(Selectors.shouldHideRemoved);

  yield effects.put(Settings.setHideRemoved(!current));
}

function* saveShowOwnRemoved(action: Action<boolean>): SagaIterator {
  const storageKey: string = yield effects.select(getStorageKey);

  yield effects.call([storage, storage.setItem], `${storageKey}.showOwnRemoved`, action.payload!);
}

function* toggleShowOwnRemoved(): SagaIterator {
  const current: boolean = yield effects.select(Selectors.shouldShowOwnRemoved);

  yield effects.put(Settings.setShowOwnRemoved(!current));
}

function* saveTimezone(action: Action<string>): SagaIterator {
  const storageKey: string = yield effects.select(getStorageKey);

  yield effects.call([storage, storage.setItem], `${storageKey}.timezone`, action.payload!);
}


export function* watchSettings(): SagaIterator {
  yield effects.all([
    effects.takeLatest<Action<boolean>>(Settings.setDarkMode, saveDarkMode),
    effects.takeLatest(Settings.toggleDarkMode, toggleDarkMode),
    effects.takeLatest<Action<boolean>>(Settings.setIs12h, saveIs12h),
    effects.takeLatest(Settings.toggleIs12h, toggleIs12h),
    effects.takeLatest<Action<boolean>>(Settings.setHideRemoved, saveHideRemoved),
    effects.takeLatest(Settings.toggleHideRemoved, toggleHideRemoved),
    effects.takeLatest<Action<boolean>>(Settings.setShowOwnRemoved, saveShowOwnRemoved),
    effects.takeLatest(Settings.toggleShowOwnRemoved, toggleShowOwnRemoved),
    effects.takeLatest(Settings.setTimezone, saveTimezone),
  ]);
}
