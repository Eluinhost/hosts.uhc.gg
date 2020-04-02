import { MatchesApi } from '../api';
import { SagaIterator } from 'redux-saga';
import { put, call, takeLatest } from 'redux-saga/effects';
import { HostFormConflicts } from '../actions';
import { Match } from '../models/Match';

function* checkHostFormConflictsSaga(action: ReturnType<typeof HostFormConflicts.start>): SagaIterator {
  try {
    yield put(HostFormConflicts.started({ parameters: action.payload }));

    const potentialConflicts: Match[] = yield call(
      MatchesApi.fetchPotentialConflicts,
      action.payload.data.region,
      action.payload.data.opens,
    );

    yield put(HostFormConflicts.success({ parameters: action.payload, result: potentialConflicts }));
  } catch (error) {
    console.error(error, 'error checking conflicts');
    yield put(HostFormConflicts.failure({ parameters: action.payload, error }));
  }
}

export function* watchCheckHostFormConflicts(): SagaIterator {
  yield takeLatest(HostFormConflicts.start, checkHostFormConflictsSaga);
}
