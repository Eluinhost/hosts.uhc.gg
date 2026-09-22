import type { SagaIterator } from 'redux-saga';
import { fork } from 'redux-saga/effects';

import { listenForHostingApplicationSagas } from '../hosting-applications/sagas';

import { watchApiKey } from './apiKey';
import { watchApproveMatch } from './approveMatch';
import { watchFetchMatchDetails } from './fetchMatchDetails';
import { watchLoadHostHistory } from './loadHostHistory';
import { refreshAuthentication } from './refreshAuthentication';
import { watchSyncTime } from './timeSync';
import { watchUpcomingMatches } from './updateUpcoming';
import { watchSettingsToggle } from './watchSettingsToggle';

// Don't include watchSettingsToggle here, we run that once at the beggining of the store to make sure data
// is loaded before first render

export default function* rootSaga(): SagaIterator {
  yield fork(watchUpcomingMatches);
  yield fork(watchApproveMatch);
  yield fork(watchLoadHostHistory);
  yield fork(watchFetchMatchDetails);
  yield fork(refreshAuthentication);
  yield fork(watchSyncTime);
  yield fork(watchSettingsToggle);
  yield fork(watchApiKey);
  yield fork(listenForHostingApplicationSagas);
}
