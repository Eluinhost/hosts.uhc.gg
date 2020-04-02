import { MatchesApi } from '../api';
import { SagaIterator } from 'redux-saga';
import { select, put, call, takeLatest } from 'redux-saga/effects';
import { LoadHostHistory } from '../actions';
import { Match } from '../models/Match';
import { getHostingHistoryCursor } from '../state/Selectors';

function* loadHostHistorySaga(action: ReturnType<typeof LoadHostHistory.start>): SagaIterator {
  try {
    yield put(LoadHostHistory.started({ parameters: action.payload }));

    const id: number | undefined = yield select(getHostingHistoryCursor);

    const result: Match[] = yield call(
      MatchesApi.fetchHistoryForHost,
      action.payload.host,
      action.payload.refresh ? undefined : id,
    );

    yield put(LoadHostHistory.success({ parameters: action.payload, result }));
  } catch (error) {
    console.error(error, 'error loading hosting history');
    yield put(LoadHostHistory.failure({ parameters: action.payload, error }));
  }
}

export function* watchLoadHostHistory(): SagaIterator {
  yield takeLatest(LoadHostHistory.start, loadHostHistorySaga);
}
