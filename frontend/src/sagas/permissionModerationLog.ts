import { PermissionsApi } from '../api';
import { SagaIterator } from 'redux-saga';
import { put, call, takeLatest } from 'redux-saga/effects';
import { RefreshPermissionModerationLog } from '../actions';
import { PermissionModerationLogEntry } from '../models/PermissionModerationLogEntry';

function* fetchPermissionModerationLogSaga(): SagaIterator {
  try {
    yield put(RefreshPermissionModerationLog.started());

    const result: PermissionModerationLogEntry[] = yield call(PermissionsApi.fetchPermissionModerationLog);

    yield put(RefreshPermissionModerationLog.success({ result }));
  } catch (error) {
    console.error(error, 'error fetching mod log');
    yield put(RefreshPermissionModerationLog.failure({ error }));
  }
}

export function* watchRefreshPermissionModerationLog(): SagaIterator {
  yield takeLatest(RefreshPermissionModerationLog.start, fetchPermissionModerationLogSaga);
}
