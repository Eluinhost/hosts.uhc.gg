import type { SagaIterator } from 'redux-saga';
import { fork } from 'redux-saga/effects';

import { listenForHostingApplicationSagas } from '../hosting-applications/sagas';
import { listenForModifierActions } from '../modifiers/sagas';

import { watchApiKey } from './apiKey';
import { watchApproveMatch } from './approveMatch';
import { watchCheckHostFormConflicts } from './checkPotentialConflicts';
import { watchFetchMatchDetails } from './fetchMatchDetails';
import { watchHostingRules } from './hostingRules';
import { watchLoadHostHistory } from './loadHostHistory';
import { watchRefreshPermissionModerationLog } from './permissionModerationLog';
import { watchPermissions } from './permissions';
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
  yield fork(watchCheckHostFormConflicts);
  yield fork(watchHostingRules);
  yield fork(watchSyncTime);
  yield fork(watchSettingsToggle);
  yield fork(watchPermissions);
  yield fork(watchRefreshPermissionModerationLog);
  yield fork(watchApiKey);
  yield fork(listenForModifierActions);
  yield fork(listenForHostingApplicationSagas);
}
