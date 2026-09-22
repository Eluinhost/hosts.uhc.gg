import { Intent } from '@blueprintjs/core';
import { getDefaultStore } from 'jotai';
import type { SagaIterator } from 'redux-saga';
import { takeLatest, put, call, takeEvery } from 'redux-saga/effects';

import { accessTokenAtom } from '../../atoms/authentication';
import type { ManageQuizQuestion, QuizQuestion } from '../../models/QuizQuestion';
import { showToast } from '../../services/AppToaster';
import { GenericError } from '../../utils/GenericError';

import { QuizQuestions } from './actions';
import { fetchQuizQuestions, createQuizQuestion, deleteQuizQuestion, fetchQuizQuestionsForManagement } from './api';

const store = getDefaultStore();

export class FetchQuizQuestionsError extends GenericError {
  constructor(public cause: unknown) {
    super(`Failed to lookup quiz questions`, cause);
  }
}

function* fetchQuizQuestionsSaga(): SagaIterator {
  yield put(QuizQuestions.fetch.started());

  try {
    const questions: Array<QuizQuestion> = yield call(fetchQuizQuestions);

    yield put(QuizQuestions.fetch.completed(questions));
  } catch (err) {
    const error = new FetchQuizQuestionsError(err);
    console.error(error);
    yield put(QuizQuestions.fetch.completed.failed(error));
  }
}

export class CreateQuizQuestionError extends GenericError {
  constructor(public cause: unknown) {
    super(`Failed to create quiz question`, cause);
  }
}

function* createQuizQuestionSaga({
  payload: { data, onSuccess },
}: ReturnType<typeof QuizQuestions.create.start>): SagaIterator {
  yield put(QuizQuestions.create.started(data));

  try {
    const accessToken = store.get(accessTokenAtom);
    const result: { id: number } = yield call(createQuizQuestion, data, accessToken ?? 'NO ACCESS TOKEN');

    yield put(QuizQuestions.create.completed(result));
    yield call(showToast, { message: 'Created new question', intent: Intent.SUCCESS });
    yield call(onSuccess);
    yield put(QuizQuestions.fetchForManagement.start());
  } catch (err) {
    const error = new CreateQuizQuestionError(err);
    console.error(error);
    yield put(QuizQuestions.create.completed.failed(error));
    yield call(showToast, { message: 'Error creating question', intent: Intent.DANGER });
  }
}

export class DeleteQuizQuestionError extends GenericError {
  constructor(public cause: unknown) {
    super(`Failed to delete quiz question`, cause);
  }
}

function* deleteQuizQuestionSaga({ payload: { id } }: ReturnType<typeof QuizQuestions.delete.start>): SagaIterator {
  yield put(QuizQuestions.delete.started(id));

  try {
    const accessToken = store.get(accessTokenAtom);
    yield call(deleteQuizQuestion, id, accessToken ?? 'NO ACCESS TOKEN');

    yield put(QuizQuestions.delete.completed(id));
    yield call(showToast, { message: 'Question deleted', intent: Intent.SUCCESS });
    yield put(QuizQuestions.fetchForManagement.start());
  } catch (err) {
    const error = new DeleteQuizQuestionError(err);
    console.error(error);
    yield put(QuizQuestions.delete.completed.failed(error));
    yield call(showToast, { message: 'Error deleting question', intent: Intent.DANGER });
  }
}

export class FetchQuizQuestionsForManagementError extends GenericError {
  constructor(public cause: unknown) {
    super(`Failed to fetch quiz questions for management`, cause);
  }
}

function* fetchQuizQuestionsForManagementSaga(): SagaIterator {
  yield put(QuizQuestions.fetchForManagement.started());

  try {
    const accessToken = store.get(accessTokenAtom);
    const result: Array<ManageQuizQuestion> = yield call(
      fetchQuizQuestionsForManagement,
      accessToken ?? 'NO ACCESS TOKEN',
    );

    yield put(QuizQuestions.fetchForManagement.completed(result));
  } catch (err) {
    const error = new FetchQuizQuestionsForManagementError(err);
    console.error(error);
    yield put(QuizQuestions.fetchForManagement.completed.failed(error));
  }
}

export function* listenForQuizQuestionsSagas(): SagaIterator {
  yield takeLatest(QuizQuestions.fetch.start, fetchQuizQuestionsSaga);
  yield takeLatest(QuizQuestions.fetchForManagement.start, fetchQuizQuestionsForManagementSaga);
  yield takeLatest(QuizQuestions.delete.start, deleteQuizQuestionSaga);
  // using takeEvery here as it uses callbacks in the trigger action
  yield takeEvery(QuizQuestions.create.start, createQuizQuestionSaga);
}
