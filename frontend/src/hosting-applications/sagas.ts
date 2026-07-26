import { SagaIterator } from 'redux-saga';
import { takeLatest, put, call, select, fork, takeEvery } from 'redux-saga/effects';

import { HostApplications } from './actions';
import {
  fetchHostApplications,
  fetchHostApplicationDetails,
  reviewHostApplication,
  createHostApplication,
} from './api';
import { getAccessToken } from '../state/Selectors';
import { HostApplication, HostApplicationDetails } from '../models/HostApplication';
import { listenForQuizQuestionsSagas } from './questions/sagas';
import { AppToaster } from '../services/AppToaster';
import { Intent } from '@blueprintjs/core';

export class FetchHostingApplicationsError extends Error {
  constructor(public cause: any) {
    super(`Failed to fetch host applications, caused by:\n ${cause?.message ?? cause}`);
  }
}

function* fetchHostingApplicationsSaga(): SagaIterator {
  yield put(HostApplications.fetch.list.started());

  try {
    const result: Array<HostApplication> = yield call(fetchHostApplications);

    yield put(HostApplications.fetch.list.completed(result));
  } catch (err) {
    const error = new FetchHostingApplicationsError(err);
    console.error(error);
    yield put(HostApplications.fetch.list.completed.failed(error));
  }
}

export class FetchHostingApplicationError extends Error {
  constructor(public id: number, public cause: any) {
    super(`Failed to fetch host application '${id}', caused by:\n ${cause?.message ?? cause}`);
  }
}

function* fetchHostingApplicationDetailsSaga({
  payload: { id },
}: ReturnType<typeof HostApplications.fetch.individual.start>): SagaIterator {
  yield put(HostApplications.fetch.individual.started(id));

  try {
    const accessToken = yield select(getAccessToken);
    const result: HostApplicationDetails = yield call(fetchHostApplicationDetails, id, accessToken);

    yield put(HostApplications.fetch.individual.completed(result));
  } catch (err) {
    const error = new FetchHostingApplicationError(id, err);
    console.error(error);
    yield put(HostApplications.fetch.individual.completed.failed(error));
  }
}

export class ReviewHostingApplicationError extends Error {
  constructor(public id: number, public cause: any) {
    super(`Failed to review host application '${id}', caused by:\n ${cause?.message ?? cause}`);
  }
}

function* reviewHostingApplicationDetailsSaga({
  payload: { id, status, rejectReason, onSuccess },
}: ReturnType<typeof HostApplications.respond.start>): SagaIterator {
  yield put(HostApplications.respond.started({ id, status, rejectReason }));

  try {
    const accessToken = yield select(getAccessToken);
    yield call(reviewHostApplication, id, status, accessToken, rejectReason);

    yield put(HostApplications.respond.completed({ id, status, rejectReason }));
    // refresh list to have the response show up immediately
    yield put(HostApplications.fetch.list.start());
    onSuccess();
  } catch (err) {
    const error = new ReviewHostingApplicationError(id, err);
    console.error(error);
    yield put(HostApplications.respond.completed.failed(error));
    yield call([AppToaster, 'show'], { message: 'Error responding to application', intent: Intent.DANGER });
  }
}

export class CreateHostingApplicationError extends Error {
  constructor(public cause: any) {
    super(`Failed to create host application, caused by:\n ${cause?.message ?? cause}`);
  }
}

function* createHostingApplicationSaga({
  payload: { data },
}: ReturnType<typeof HostApplications.create.start>): SagaIterator {
  yield put(HostApplications.create.started(data));

  try {
    const accessToken = yield select(getAccessToken);
    yield call(createHostApplication, data, accessToken);

    yield put(HostApplications.create.completed(data));
  } catch (err) {
    const error = new CreateHostingApplicationError(err);
    console.error(error);
    yield put(HostApplications.create.completed.failed(error));
  }
}

export function* listenForHostingApplicationSagas(): SagaIterator {
  yield takeLatest(HostApplications.fetch.list.start, fetchHostingApplicationsSaga);
  yield takeLatest(HostApplications.fetch.individual.start, fetchHostingApplicationDetailsSaga);
  yield takeLatest(HostApplications.create.start, createHostingApplicationSaga);
  // takeEvery as callback is in action
  yield takeEvery(HostApplications.respond.start, reviewHostingApplicationDetailsSaga);
  yield fork(listenForQuizQuestionsSagas);
}
