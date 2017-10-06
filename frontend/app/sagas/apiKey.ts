import { SagaIterator, effects } from 'redux-saga';
import { getAccessToken } from '../state/Selectors';
import { FetchApiKey, RegenerateApiKey } from '../actions';
import * as Api from '../api';
import { Action } from 'redux-actions';

function* fetchApiKeySaga(): SagaIterator {
  const accessToken: string | null = yield effects.select(getAccessToken);

  yield effects.put(FetchApiKey.started());

  try {
    if (!accessToken)
      throw new Api.NotAuthenticatedError();

    const result: string | null = yield effects.call(Api.getApiKey, accessToken);

    yield effects.put(FetchApiKey.success({ result }));
  } catch (error) {
    console.error('Failed to get api key');
    yield effects.put(FetchApiKey.failure({ error }));
  }
}

function* regenerateApiKeySaga(): SagaIterator {
  const accessToken: string | null = yield effects.select(getAccessToken);

  yield effects.put(RegenerateApiKey.started());

  try {
    if (!accessToken)
      throw new Api.NotAuthenticatedError();

    const result: string = yield effects.call(Api.regenerateApiKey, accessToken);

    yield effects.put(RegenerateApiKey.success({ result }));
  } catch (error) {
    console.error('Failed to regenerate api key');
    yield effects.put(RegenerateApiKey.failure({ error }));
  }
}

export function* watchApiKey(): SagaIterator {
  yield effects.all([
    effects.takeLatest<Action<void>>(FetchApiKey.start, fetchApiKeySaga),
    effects.takeLatest<Action<void>>(RegenerateApiKey.start, regenerateApiKeySaga),
  ]);
}
