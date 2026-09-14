import { PermissionsApi } from '../api';
import { SagaIterator } from 'redux-saga';
import { put, call, takeLatest, select } from 'redux-saga/effects';
import { RefreshPermissionModerationLog } from '../actions';
import { PermissionModerationLogEntry } from '../models/PermissionModerationLogEntry';
import { getAccessToken } from '../state/Selectors';
import { wrapError } from '../utils/wrapError';

function* fetchPermissionModerationLogSaga(): SagaIterator {
  try {
    yield put(RefreshPermissionModerationLog.started());

    const accessToken: string | null = yield select(getAccessToken);
    const result: PermissionModerationLogEntry[] = yield call(PermissionsApi.fetchPermissionModerationLog, accessToken);

    yield put(RefreshPermissionModerationLog.success({ result }));
  } catch (error) {
    console.error(error, 'error fetching mod log');
    yield put(RefreshPermissionModerationLog.failure({ error: wrapError(error) }));
  }
}

export function* watchRefreshPermissionModerationLog(): SagaIterator {
  yield takeLatest(RefreshPermissionModerationLog.start, fetchPermissionModerationLogSaga);
}
