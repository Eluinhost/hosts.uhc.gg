import { MatchesApi } from '../api';
import { SagaIterator } from 'redux-saga';
import { put, select, call, takeLatest } from 'redux-saga/effects';
import { FetchMatchDetailsParameters, FetchMatchDetails } from '../actions';
import { Match } from '../models/Match';
import { Action } from 'redux-actions';
import { getUpcomingLastUpdated, getUpcomingMatches } from '../state/Selectors';
import * as moment from 'moment';
import { find } from 'ramda';

function* fetchMatchDetailsSaga(action: Action<FetchMatchDetailsParameters>): SagaIterator {
  const parameters = action.payload!;

  try {
    yield put(FetchMatchDetails.started({ parameters }));

    const lastUpdated: moment.Moment | null = yield select(getUpcomingLastUpdated);

    let match: Match | undefined = undefined;

    // if upcoming was refreshed recently look for the match in it
    if (lastUpdated && lastUpdated.isAfter(moment.utc().subtract(10, 'minutes'))) {
      const upcoming: Match[] = yield select(getUpcomingMatches);

      match = find<Match>(m => m.id === parameters.id, upcoming);
    }

    if (!match) {
      match = yield call(MatchesApi.fetchSingle, parameters.id);
    }

    yield put(FetchMatchDetails.success({ parameters, result: match || null }));
  } catch (error) {
    console.error(error, 'error fetching match');
    yield put(FetchMatchDetails.failure({ parameters, error }));
  }
}

export function* watchFetchMatchDetails(): SagaIterator {
  yield takeLatest<Action<FetchMatchDetailsParameters>>(FetchMatchDetails.start, fetchMatchDetailsSaga);
}
