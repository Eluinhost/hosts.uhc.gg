import { find } from 'ramda';
import type { SagaIterator } from 'redux-saga';
import { put, select, call, takeLatest } from 'redux-saga/effects';

import { FetchMatchDetails } from '../actions';
import { MatchesApi } from '../api';
import dayjs, { type Dayjs } from '../dayjs';
import type { Match } from '../models/Match';
import { getUpcomingLastUpdated, getUpcomingMatches } from '../state/Selectors';
import { wrapError } from '../utils/wrapError';

function* fetchMatchDetailsSaga(action: ReturnType<typeof FetchMatchDetails.start>): SagaIterator {
  try {
    yield put(FetchMatchDetails.started({ parameters: action.payload }));

    const lastUpdated: Dayjs | null = yield select(getUpcomingLastUpdated);

    let match: Match | undefined = undefined;

    // if upcoming was refreshed recently look for the match in it
    if (lastUpdated && lastUpdated.isAfter(dayjs.utc().subtract(10, 'minutes'))) {
      const upcoming: Match[] = yield select(getUpcomingMatches);

      match = find<Match>(m => m.id === action.payload.id, upcoming);
    }

    if (!match) {
      match = yield call(MatchesApi.fetchSingle, action.payload.id);
    }

    yield put(FetchMatchDetails.success({ parameters: action.payload, result: match || null }));
  } catch (error) {
    console.error(error, 'error fetching match');
    yield put(FetchMatchDetails.failure({ parameters: action.payload, error: wrapError(error) }));
  }
}

export function* watchFetchMatchDetails(): SagaIterator {
  yield takeLatest(FetchMatchDetails.start, fetchMatchDetailsSaga);
}
