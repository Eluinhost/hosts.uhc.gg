import { PermissionsApi } from '../api';
import { SagaIterator, effects } from 'redux-saga';
import { RefreshPermissionModerationLog } from '../actions';
import { PermissionModerationLogEntry } from '../models/PermissionModerationLogEntry';

function* fetchPermissionModerationLogSaga(): SagaIterator {
  try {
    yield effects.put(RefreshPermissionModerationLog.started());

    const result: PermissionModerationLogEntry[] = yield effects.call(PermissionsApi.fetchPermissionModerationLog);

    yield effects.put(RefreshPermissionModerationLog.success({ result }));
  } catch (error) {
    console.error(error, 'error fetching mod log');
    yield effects.put(RefreshPermissionModerationLog.failure({ error }));
  }
}

export function* watchRefreshPermissionModerationLog(): SagaIterator {
  yield effects.takeLatest(RefreshPermissionModerationLog.start, fetchPermissionModerationLogSaga);
}
