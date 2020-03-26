import { MatchesApi } from '../api';
import { SagaIterator } from 'redux-saga';
import { put, call, takeLatest } from 'redux-saga/effects';
import { UpdateUpcoming } from '../actions';
import { Match } from '../models/Match';

function* fetchUpcomingSaga(): SagaIterator {
  try {
    yield put(UpdateUpcoming.started());

    const result: Match[] = yield call(MatchesApi.fetchUpcomingMatches);

    yield put(UpdateUpcoming.success({ result }));
  } catch (error) {
    console.error(error, 'error updating upcoming');
    yield put(UpdateUpcoming.failure({ error }));
  }
}

export function* watchUpcomingMatches(): SagaIterator {
  yield takeLatest(UpdateUpcoming.start, fetchUpcomingSaga);
}
