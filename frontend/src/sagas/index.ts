import type { SagaIterator } from 'redux-saga';
import { fork } from 'redux-saga/effects';

import { listenForHostingApplicationSagas } from '../hosting-applications/sagas';

import { watchApproveMatch } from './approveMatch';
import { authentication } from './authentication';

// Don't include watchSettingsToggle here, we run that once at the beggining of the store to make sure data
// is loaded before first render

export default function* rootSaga(): SagaIterator {
  yield fork(watchApproveMatch);
  yield fork(authentication);
  yield fork(listenForHostingApplicationSagas);
}
