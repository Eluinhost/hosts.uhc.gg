import { MatchesApi } from '../api';
import { SagaIterator } from 'redux-saga';
import { select, put, call, takeLatest } from 'redux-saga/effects';
import { LoadHostHistory, LoadHostHistoryParameters } from '../actions';
import { Match } from '../models/Match';
import { Action } from 'redux-actions';
import { getHostingHistoryCursor } from '../state/Selectors';

function* loadHostHistorySaga(action: Action<LoadHostHistoryParameters>): SagaIterator {
  const parameters = action.payload!;

  try {
    yield put(LoadHostHistory.started({ parameters }));

    const id: number | undefined = yield select(getHostingHistoryCursor);

    const result: Match[] = yield call(
      MatchesApi.fetchHistoryForHost,
      parameters.host,
      parameters.refresh ? undefined : id,
    );

    yield put(LoadHostHistory.success({ parameters, result }));
  } catch (error) {
    console.error(error, 'error loading hosting history');
    yield put(LoadHostHistory.failure({ parameters, error }));
  }
}

export function* watchLoadHostHistory(): SagaIterator {
  yield takeLatest<Action<LoadHostHistoryParameters>>(LoadHostHistory.start, loadHostHistorySaga);
}
