import { MatchesApi } from '../api';
import { SagaIterator, effects } from 'redux-saga';
import { FetchMatchDetailsParameters, FetchMatchDetails } from '../actions';
import { Match } from '../Match';
import { Action } from 'redux-actions';
import { getUpcomingLastUpdated, getUpcomingMatches } from '../state/Selectors';
import * as moment from 'moment-timezone';
import { find } from 'ramda';

function* fetchMatchDetailsSaga(action: Action<FetchMatchDetailsParameters>): SagaIterator {
  const parameters = action.payload!;

  try {
    yield effects.put(FetchMatchDetails.started({ parameters }));

    const lastUpdated: moment.Moment | null = yield effects.select(getUpcomingLastUpdated);

    let match: Match | null = null;

    // if upcoming was refreshed recently look for the match in it
    if (lastUpdated && lastUpdated.isAfter(moment.utc().subtract(10, 'minutes'))) {
      const upcoming: Match[] = yield effects.select(getUpcomingMatches);

      match = find<Match>(m => m.id === parameters.id, upcoming);
    }

    if (!match) {
      match = yield effects.call(MatchesApi.fetchSingle, parameters.id);
    }

    yield effects.put(FetchMatchDetails.success({ parameters, result: match }));
  } catch (error) {
    console.log(error, 'error fetching match');
    yield effects.put(FetchMatchDetails.failure({ parameters, error }));
  }
}

export function* watchFetchMatchDetails(): SagaIterator {
  yield effects.takeLatest<Action<FetchMatchDetailsParameters>>(FetchMatchDetails.start, fetchMatchDetailsSaga);
}
