import { MatchesApi } from '../api';
import { SagaIterator, effects } from 'redux-saga';
import { LoadHostHistory, LoadHostHistoryParameters } from '../actions';
import { Match } from '../Match';
import { Action } from 'redux-actions';
import { getHostingHistoryCursor } from '../state/Selectors';

function* loadHostHistorySaga(action: Action<LoadHostHistoryParameters>): SagaIterator {
  const parameters = action.payload!;

  try {
    yield effects.put(LoadHostHistory.started({ parameters }));

    const id: number | undefined = yield effects.select(getHostingHistoryCursor);

    const result: Match[] = yield effects.call(
      MatchesApi.fetchHistoryForHost,
      parameters.host,
      parameters.refresh ? undefined : id,
    );

    yield effects.put(LoadHostHistory.success({ parameters, result }));
  } catch (error) {
    console.log(error, 'error loading hosting history');
    yield effects.put(LoadHostHistory.failure({ parameters, error }));
  }
}

export function* watchLoadHostHistory(): SagaIterator {
  yield effects.takeLatest<Action<LoadHostHistoryParameters>>(LoadHostHistory.start, loadHostHistorySaga);
}
