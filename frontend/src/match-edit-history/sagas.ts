import { SagaIterator } from 'redux-saga';
import { takeLatest, put, call, delay } from 'redux-saga/effects';

import { FETCH_MATCH_EDIT_HISTORY } from './actions';
import { fetchMatchEditHistory } from './api';
import { Match } from '../models/Match';

export class FetchMatchEditHistoryError extends Error {
  constructor(public id: number, public cause: any) {
    super(`failed to fetch match history for ${id}. \nCaused by: ${cause.stack || cause}`);
  }
}

export function* matchEditHistorySagas(): SagaIterator {
  yield takeLatest(FETCH_MATCH_EDIT_HISTORY.TRIGGER, fetchMatchHistorySaga);
}

function* fetchMatchHistorySaga(action: ReturnType<typeof FETCH_MATCH_EDIT_HISTORY.TRIGGER>): SagaIterator {
  yield put(FETCH_MATCH_EDIT_HISTORY.STARTED(action.payload.id));

  try {
    const edits: Match[] = yield call(fetchMatchEditHistory, action.payload.id);

    yield put(FETCH_MATCH_EDIT_HISTORY.COMPLETED(edits));
  } catch (err) {
    const error = new FetchMatchEditHistoryError(action.payload.id, err);

    console.error(error);
    yield put(FETCH_MATCH_EDIT_HISTORY.COMPLETED.failed(error));
  }
}
