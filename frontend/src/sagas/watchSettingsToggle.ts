import { SagaIterator } from 'redux-saga';
import { select, takeLatest, put, all, fork } from 'redux-saga/effects';
import { Settings } from '../actions';
import * as Selectors from '../state/Selectors';
import { ActionFunction1, Action, ActionFunction0 } from 'redux-actions';
import { ApplicationState } from '../state/ApplicationState';

const genericToggle = (
  listen: ActionFunction0<Action<void>>,
  setter: ActionFunction1<boolean, Action<boolean>>,
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
