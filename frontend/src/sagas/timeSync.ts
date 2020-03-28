import { ServerTimeApi } from '../api';
import { SagaIterator } from 'redux-saga';
import { delay, put, call, take, fork, takeLatest, race } from 'redux-saga/effects';
import { SyncTime } from '../actions';
import moment from 'moment-timezone';

function* fetchServerTimeSaga(): SagaIterator {
  try {
    yield put(SyncTime.started());

    const serverTime: moment.Moment = yield call(ServerTimeApi.fetchServerTime);

    const diff = serverTime.diff(moment.utc());

    yield put(SyncTime.success({ result: diff }));
  } catch (error) {
    console.error(error, 'error updating upcoming');
    yield put(SyncTime.failure({ error }));
  }
}

export function* initialSync(): SagaIterator {
  // keeps trying with ramp up delay until success (up to 10 sec)
  let delayTime = 1000;

  while (true) {
    yield put(SyncTime.start());

    const { success } = yield race({
      success: take(SyncTime.success),
      failure: take(SyncTime.failure),
    });

    if (success) {
      return;
    }

    delayTime += 1000;

    yield delay(Math.min(delayTime, 10000));
  }
}

export function* watchSyncTime(): SagaIterator {
  yield fork(initialSync);
  yield takeLatest(SyncTime.start, fetchServerTimeSaga);
}
