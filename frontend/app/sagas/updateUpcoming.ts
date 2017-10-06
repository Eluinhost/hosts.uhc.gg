import { fetchUpcomingMatches } from '../api';
import { SagaIterator, effects } from 'redux-saga';
import { UpdateUpcoming } from '../actions';
import { Match } from '../Match';

function* fetchUpcomingSaga(): SagaIterator {
  try {
    yield effects.put(UpdateUpcoming.started());

    const result: Match[] = yield effects.call(fetchUpcomingMatches);

    yield effects.put(UpdateUpcoming.success({ result }));
  } catch (error) {
    console.log(error, 'error updating upcoming');
    yield effects.put(UpdateUpcoming.failure({ error }));
  }
}

export function* watchUpcomingMatches(): SagaIterator {
  yield effects.takeLatest(UpdateUpcoming.start, fetchUpcomingSaga);
}
