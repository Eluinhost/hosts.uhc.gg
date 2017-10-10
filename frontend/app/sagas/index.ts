import { effects, SagaIterator } from 'redux-saga';
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
  yield effects.all([
    effects.fork(watchUpcomingMatches),
    effects.fork(watchRemoveMatch),
    effects.fork(watchApproveMatch),
    effects.fork(watchLoadHostHistory),
    effects.fork(watchFetchMatchDetails),
    effects.fork(refreshAuthentication),
    effects.fork(watchCheckHostFormConflicts),
    effects.fork(watchHostingRules),
    effects.fork(watchSyncTime),
    effects.fork(watchSettingsToggle),
    effects.fork(watchPermissions),
    effects.fork(watchRefreshPermissionModerationLog),
    effects.fork(watchApiKey),
  ]);
}
