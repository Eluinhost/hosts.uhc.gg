import type { SagaIterator } from 'redux-saga';
import { select, takeLatest, put, all, fork } from 'redux-saga/effects';
import type { ActionCreator } from 'typesafe-redux-helpers';

import { Settings } from '../actions';
import type { ApplicationState } from '../state/ApplicationState';
import * as Selectors from '../state/Selectors';

const genericToggle = (
  listen: ActionCreator<void, unknown, string>,
  setter: ActionCreator<boolean, boolean, string>,
  selector: (state: ApplicationState) => boolean,
) =>
  function* (): SagaIterator {
    yield takeLatest(listen, function* (): SagaIterator {
      const current: boolean = yield select(selector);
      yield put(setter(!current));
    });
  };

export function* watchSettingsToggle(): SagaIterator {
  yield all([
    fork(genericToggle(Settings.toggleDarkMode, Settings.setDarkMode, Selectors.isDarkMode)),
    fork(genericToggle(Settings.toggleIs12h, Settings.setIs12h, Selectors.is12hFormat)),
    fork(genericToggle(Settings.toggleHideRemoved, Settings.setHideRemoved, Selectors.shouldHideRemoved)),
    fork(genericToggle(Settings.toggleShowOwnRemoved, Settings.setShowOwnRemoved, Selectors.shouldShowOwnRemoved)),
  ]);
}
