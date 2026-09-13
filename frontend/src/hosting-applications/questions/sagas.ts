import { SagaIterator } from 'redux-saga';
import { takeLatest, put, call, select, takeEvery } from 'redux-saga/effects';

import { fetchQuizQuestions, createQuizQuestion, deleteQuizQuestion, fetchQuizQuestionsForManagement } from './api';
import { ManageQuizQuestion, QuizQuestion } from '../../models/QuizQuestion';
import { getAccessToken } from '../../state/Selectors';
import { AppToaster } from '../../services/AppToaster';
import { Intent } from '@blueprintjs/core';
import { QuizQuestions } from './actions';

export class FetchQuizQuestionsError extends Error {
  constructor(public cause: any) {
    super(`Failed to lookup quiz questions, caused by:\n ${cause?.message ?? cause}`);
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

export class CreateQuizQuestionError extends Error {
  constructor(public cause: any) {
    super(`Failed to create quiz question, caused by:\n ${cause?.message ?? cause}`);
  }
}

function* createQuizQuestionSaga({
  payload: { data, onSuccess },
}: ReturnType<typeof QuizQuestions.create.start>): SagaIterator {
  yield put(QuizQuestions.create.started(data));

  try {
    const accessToken = yield select(getAccessToken);
    const result: { id: number } = yield call(createQuizQuestion, data, accessToken);

    yield put(QuizQuestions.create.completed(result));
    yield call([AppToaster, 'show'], { message: 'Created new question', intent: Intent.SUCCESS });
    yield call(onSuccess);
    yield put(QuizQuestions.fetchForManagement.start());
  } catch (err) {
    const error = new CreateQuizQuestionError(err);
    console.error(error);
    yield put(QuizQuestions.create.completed.failed(error));
    yield call([AppToaster, 'show'], { message: 'Error creating question', intent: Intent.DANGER });
  }
}

export class DeleteQuizQuestionError extends Error {
  constructor(public cause: any) {
    super(`Failed to delete quiz question, caused by:\n ${cause?.message ?? cause}`);
  }
}

function* deleteQuizQuestionSaga({ payload: { id } }: ReturnType<typeof QuizQuestions.delete.start>): SagaIterator {
  yield put(QuizQuestions.delete.started(id));

  try {
    const accessToken = yield select(getAccessToken);
    yield call(deleteQuizQuestion, id, accessToken);

    yield put(QuizQuestions.delete.completed(id));
    yield call([AppToaster, 'show'], { message: 'Question deleted', intent: Intent.SUCCESS });
    yield put(QuizQuestions.fetchForManagement.start());
  } catch (err) {
    const error = new DeleteQuizQuestionError(err);
    console.error(error);
    yield put(QuizQuestions.delete.completed.failed(error));
    yield call([AppToaster, 'show'], { message: 'Error deleting question', intent: Intent.DANGER });
  }
}

export class FetchQuizQuestionsForManagementError extends Error {
  constructor(public cause: any) {
    super(`Failed to fetch quiz questions for management, caused by:\n ${cause?.message ?? cause}`);
  }
}

function* fetchQuizQuestionsForManagementSaga(): SagaIterator {
  yield put(QuizQuestions.fetchForManagement.started());

  try {
    const accessToken = yield select(getAccessToken);
    const result: Array<ManageQuizQuestion> = yield call(fetchQuizQuestionsForManagement, accessToken);

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
