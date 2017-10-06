import { effects, SagaIterator } from 'redux-saga';
import { watchUpcomingMatches } from './updateUpcoming';
import { watchRemoveMatch } from './removeMatch';
import { watchApproveMatch } from './approveMatch';
import { watchLoadHostHistory } from './loadHostHistory';
import { watchFetchMatchDetails } from './fetchMatchDetails';
import { watchAuthentication } from './authentication';
import { watchCheckHostFormConflicts } from './checkPotentialConflicts';
import { watchHostingRules } from './hostingRules';
import { watchSyncTime } from './timeSync';
import { watchSettings } from './settings';
import { watchPermissions } from './permissions';
import { watchRefreshPermissionModerationLog } from './permissionModerationLog';
import { watchApiKey } from './apiKey';

export default function* rootSaga(): SagaIterator {
  yield effects.all([
    effects.fork(watchUpcomingMatches),
    effects.fork(watchRemoveMatch),
    effects.fork(watchApproveMatch),
    effects.fork(watchLoadHostHistory),
    effects.fork(watchFetchMatchDetails),
    effects.fork(watchAuthentication),
    effects.fork(watchCheckHostFormConflicts),
    effects.fork(watchHostingRules),
    effects.fork(watchSyncTime),
    effects.fork(watchSettings),
    effects.fork(watchPermissions),
    effects.fork(watchRefreshPermissionModerationLog),
    effects.fork(watchApiKey),
  ]);
}
