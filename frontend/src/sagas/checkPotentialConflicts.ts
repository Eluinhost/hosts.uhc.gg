import { MatchesApi } from '../api';
import { SagaIterator } from 'redux-saga';
import { put, call, takeLatest, delay } from 'redux-saga/effects';
import { HostFormConflicts, HostFormConflictsParameters } from '../actions';
import { Match } from '../models/Match';
import { Action } from 'redux-actions';

function* checkHostFormConflictsSaga(action: Action<HostFormConflictsParameters>): SagaIterator {
  const parameters = action.payload!;

  try {
    yield put(HostFormConflicts.started({ parameters }));

    const potentialConflicts: Match[] = yield call(
      MatchesApi.fetchPotentialConflicts,
      parameters.data.region,
      parameters.data.opens,
    );

    yield put(HostFormConflicts.success({ parameters, result: potentialConflicts }));
  } catch (error) {
    console.error(error, 'error checking conflicts');
    yield put(HostFormConflicts.failure({ parameters, error }));
  }
}

export function* watchCheckHostFormConflicts(): SagaIterator {
  yield takeLatest<Action<HostFormConflictsParameters>>(HostFormConflicts.start, checkHostFormConflictsSaga);
}
