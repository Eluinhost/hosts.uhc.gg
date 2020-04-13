import { SagaIterator } from 'redux-saga';
import { takeLatest, put, call } from 'redux-saga/effects';

import { FETCH_MODIFIERS } from './actions';
import { getAllModifiers } from './api';
import { Modifier } from './Modifier';

class FetchModifiersError extends Error {
  constructor(public cause: any) {
    super(`Failed to lookup modifiers, caused by:\n ${cause?.message ?? cause}`);
  }
}

function* fetchModifiers(): SagaIterator {
  yield put(FETCH_MODIFIERS.STARTED());

  try {
    const modifiers: Modifier[] = yield call(getAllModifiers);

    yield put(FETCH_MODIFIERS.COMPLETED(modifiers));
  } catch (err) {
    console.error(err);
    yield put(FETCH_MODIFIERS.COMPLETED.failed(new FetchModifiersError(err)));
  }
}

export function* listenForFetchModifiers(): SagaIterator {
  yield takeLatest(FETCH_MODIFIERS.TRIGGER, fetchModifiers);
}
