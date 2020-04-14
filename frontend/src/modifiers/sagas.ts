import { SagaIterator } from 'redux-saga';
import { takeLatest, put, call, select } from 'redux-saga/effects';

import { CREATE_MODIFIER, DELETE_MODIFIER, FETCH_MODIFIERS } from './actions';
import { getAllModifiers, deleteModifier, createModifier } from './api';
import { Modifier } from './Modifier';
import { getAccessToken } from '../state/Selectors';

export class FetchModifiersError extends Error {
  constructor(public cause: any) {
    super(`Failed to lookup modifiers, caused by:\n ${cause?.message ?? cause}`);
  }
}

export class DeleteModifierError extends Error {
  constructor(public id: number, public cause: any) {
    super(`Failed to delete modifier '${id}', caused by:\n ${cause?.message ?? cause}`);
  }
}

export class CreateModifierError extends Error {
  constructor(public modifier: string, public cause: any) {
    super(`Failed to create modifier: ${modifier}, caused by:\n ${cause?.message ?? cause}`);
  }
}

function* fetchModifiersSaga(): SagaIterator {
  yield put(FETCH_MODIFIERS.STARTED());

  try {
    const modifiers: Modifier[] = yield call(getAllModifiers);

    yield put(FETCH_MODIFIERS.COMPLETED(modifiers));
  } catch (err) {
    const error = new FetchModifiersError(err);
    console.error(error);
    yield put(FETCH_MODIFIERS.COMPLETED.failed(error));
  }
}

function* deleteModifierSaga(action: ReturnType<typeof DELETE_MODIFIER.TRIGGER>): SagaIterator {
  yield put(DELETE_MODIFIER.STARTED(action.payload.id));

  try {
    const token = yield select(getAccessToken) || 'NO ACCESS TOKEN IN STATE';

    yield call(deleteModifier, action.payload.id, token);

    yield put(DELETE_MODIFIER.COMPLETED(action.payload.id));
  } catch (err) {
    const error = new DeleteModifierError(action.payload.id, err);
    console.error(error);
    yield put(DELETE_MODIFIER.COMPLETED.failed(error));
  }

  // refresh modifiers after a delete
  yield put(FETCH_MODIFIERS.TRIGGER());
}

function* createModifierSaga(action: ReturnType<typeof CREATE_MODIFIER.TRIGGER>): SagaIterator {
  yield put(CREATE_MODIFIER.STARTED(action.payload.name));

  try {
    const token = yield select(getAccessToken) || 'NO ACCESS TOKEN IN STATE';

    const modifier: Modifier = yield call(createModifier, action.payload.name, token);

    yield put(CREATE_MODIFIER.COMPLETED(modifier));

    // refresh modifiers after a create
    yield put(FETCH_MODIFIERS.TRIGGER());
  } catch (err) {
    const error = new CreateModifierError(action.payload.name, err);
    console.error(error);
    yield put(CREATE_MODIFIER.COMPLETED.failed(error));
  }
}

export function* listenForModifierActions(): SagaIterator {
  yield takeLatest(FETCH_MODIFIERS.TRIGGER, fetchModifiersSaga);
  yield takeLatest(DELETE_MODIFIER.TRIGGER, deleteModifierSaga);
  yield takeLatest(CREATE_MODIFIER.TRIGGER, createModifierSaga);
}
