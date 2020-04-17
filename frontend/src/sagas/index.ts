import { SagaIterator } from 'redux-saga';
import { fork } from 'redux-saga/effects';

import { watchUpcomingMatches } from './updateUpcoming';
import { watchRemoveMatch } from './removeMatch';
import { watchApproveMatch } from './approveMatch';
import { watchLoadHostHistory } from './loadHostHistory';
import { watchFetchMatchDetails } from './fetchMatchDetails';
import { refreshAuthentication } from './refreshAuthentication';
import { watchCheckHostFormConflicts } from './checkPotentialConflicts';
import { watchHostingRules } from './hostingRules';
import { watchSyncTime } from './timeSync';
import { watchSettingsToggle } from './watchSettingsToggle';
import { watchPermissions } from './permissions';
import { watchRefreshPermissionModerationLog } from './permissionModerationLog';
import { watchApiKey } from './apiKey';
import { listenForModifierActions } from '../modifiers/sagas';
import { listenForVersionActions } from '../versions/sagas';
import { fixHostFormVersionOnVersionsUpdate, removeVanillaPlusWhenOtherScenarioAdded } from '../components/host/saga';

// Don't include watchSettingsToggle here, we run that once at the beggining of the store to make sure data
// is loaded before first render

export default function* rootSaga(): SagaIterator {
  yield fork(watchUpcomingMatches);
  yield fork(watchRemoveMatch);
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
  yield fork(listenForVersionActions);
  yield fork(fixHostFormVersionOnVersionsUpdate);
  yield fork(removeVanillaPlusWhenOtherScenarioAdded);
}
