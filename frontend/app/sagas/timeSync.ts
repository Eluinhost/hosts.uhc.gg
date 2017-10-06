import * as Api from '../api';
import { SagaIterator, effects, delay } from 'redux-saga';
import { SyncTime } from '../actions';
import * as moment from 'moment-timezone';

function* fetchServerTimeSaga(): SagaIterator {
  try {
    yield effects.put(SyncTime.started());

    const serverTime: moment.Moment = yield effects.call(Api.getServerTime);

    const diff = serverTime.diff(moment.utc());

    yield effects.put(SyncTime.success({ result: diff }));
  } catch (error) {
    console.log(error, 'error updating upcoming');
    yield effects.put(SyncTime.failure({ error }));
  }
}

export function* initialSync(): SagaIterator {
  // keeps trying with ramp up delay until success (up to 10 sec)
  let delayTime = 1000;

  while (true) {
    yield effects.put(SyncTime.start());

    const { success } = yield effects.race({
      success: effects.take(SyncTime.success),
      failure: effects.take(SyncTime.failure),
    });

    if (success) {
      return;
    }

    delayTime += 1000;

    yield effects.call(delay, Math.min(delayTime, 10000));
  }
}

export function* watchSyncTime(): SagaIterator {
  yield effects.fork(initialSync);
  yield effects.takeLatest(SyncTime.start, fetchServerTimeSaga);
}
