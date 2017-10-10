import { MatchesApi } from '../api';
import { SagaIterator, effects } from 'redux-saga';
import { HostFormConflicts, HostFormConflictsParameters } from '../actions';
import { Match } from '../models/Match';
import { Action } from 'redux-actions';
import { find } from 'ramda';
import { startAsyncValidation, stopAsyncValidation } from 'redux-form';

function* checkHostFormConflictsSaga(action: Action<HostFormConflictsParameters>): SagaIterator {
  const parameters = action.payload!;

  try {
    yield effects.put(startAsyncValidation('create-match-form'));
    yield effects.put(HostFormConflicts.started({ parameters }));

    const potentialConflicts: Match[] = yield effects.call(
      MatchesApi.fetchPotentialConflicts,
      parameters.data.region,
      parameters.data.opens,
    );

    yield effects.put(HostFormConflicts.success({ parameters, result: potentialConflicts }));

    let confirmedConflicts = potentialConflicts
      .filter(conflict => conflict.opens.isSame(parameters.data.opens));

    // If the game being hosted is not a tournament it is allowed to overhost tournaments
    if (!parameters.data.tournament) {
      confirmedConflicts = confirmedConflicts.filter(conflict => !conflict.tournament);
    }

    if (confirmedConflicts.length) {
      // conflict should be whatever isn't a tournament, if they're all tournaments just return whatever is first
      const conflict = find<Match>(m => !m.tournament, confirmedConflicts) || confirmedConflicts[0];

      // tslint:disable-next-line:max-line-length
      const message = `Conflicts with /u/${conflict.author}'s #${conflict.count} (${conflict.region} - ${conflict.opens.format('HH:mm z')})`;

      yield effects.put(stopAsyncValidation('create-match-form', {
        opens: message,
        region: message,
      }));
    } else {
      yield effects.put(stopAsyncValidation('create-match-form'));
    }
  } catch (error) {
    console.error(error, 'error checking conflicts');
    yield effects.put(HostFormConflicts.failure({ parameters, error }));
    yield effects.put(stopAsyncValidation('create-match-form', {
      opens: 'Failed to lookup conflicts',
      region: 'Failed to lookup conflicts',
    }));
  }
}

export function* watchCheckHostFormConflicts(): SagaIterator {
  yield effects.takeLatest<Action<HostFormConflictsParameters>>(HostFormConflicts.start, checkHostFormConflictsSaga);
}
