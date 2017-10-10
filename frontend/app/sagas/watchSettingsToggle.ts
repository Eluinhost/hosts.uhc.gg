import { SagaIterator, effects } from 'redux-saga';
import { Settings } from '../actions';
import * as Selectors from '../state/Selectors';
import { ActionFunction1, Action, ActionFunction0 } from 'redux-actions';
import { ApplicationState } from '../state/ApplicationState';

const genericToggle = (
  listen: ActionFunction0<Action<void>>,
  setter: ActionFunction1<boolean, Action<boolean>>,
  selector: (state: ApplicationState) => boolean,
) => function* (): SagaIterator {
  yield effects.takeLatest(listen, function* (): SagaIterator {
    const current: boolean = yield effects.select(selector);
    yield effects.put(setter(!current));
  });
};

export function* watchSettingsToggle(): SagaIterator {
  yield effects.all([
    effects.fork(genericToggle(Settings.toggleDarkMode, Settings.setDarkMode, Selectors.isDarkMode)),
    effects.fork(genericToggle(Settings.toggleIs12h, Settings.setIs12h, Selectors.is12hFormat)),
    effects.fork(genericToggle(Settings.toggleHideRemoved, Settings.setHideRemoved, Selectors.shouldHideRemoved)),
    effects.fork(
      genericToggle(Settings.toggleShowOwnRemoved, Settings.setShowOwnRemoved, Selectors.shouldShowOwnRemoved),
    ),
  ]);
}
