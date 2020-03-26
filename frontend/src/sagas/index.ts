import { SagaIterator } from 'redux-saga';
import { all, fork } from 'redux-saga/effects';
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

// Don't include watchSettingsToggle here, we run that once at the beggining of the store to make sure data
// is loaded before first render

export default function* rootSaga(): SagaIterator {
  yield all([
    fork(watchUpcomingMatches),
    fork(watchRemoveMatch),
    fork(watchApproveMatch),
    fork(watchLoadHostHistory),
    fork(watchFetchMatchDetails),
    fork(refreshAuthentication),
    fork(watchCheckHostFormConflicts),
    fork(watchHostingRules),
    fork(watchSyncTime),
    fork(watchSettingsToggle),
    fork(watchPermissions),
    fork(watchRefreshPermissionModerationLog),
    fork(watchApiKey),
  ]);
}
