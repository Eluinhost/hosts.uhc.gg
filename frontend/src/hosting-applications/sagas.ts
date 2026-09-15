import { Intent } from '@blueprintjs/core';
import { SagaIterator } from 'redux-saga';
import { takeLatest, put, call, select, fork, takeEvery } from 'redux-saga/effects';

import { HostApplication, HostApplicationDetails } from '../models/HostApplication';
import { showToast } from '../services/AppToaster';
import { getAccessToken } from '../state/Selectors';
import { GenericError } from '../utils/GenericError';

import { HostApplications } from './actions';
import {
  fetchHostApplications,
  fetchHostApplicationDetails,
  reviewHostApplication,
  createHostApplication,
} from './api';
import { listenForQuizQuestionsSagas } from './questions/sagas';

export class FetchHostingApplicationsError extends GenericError {
  constructor(public cause: unknown) {
    super(`Failed to fetch host applications`, cause);
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

export class FetchHostingApplicationError extends GenericError {
  constructor(
    public id: number,
    public cause: unknown,
  ) {
    super(`Failed to fetch host application '${id}'`, cause);
  }
}

function* fetchHostingApplicationDetailsSaga({
  payload: { id },
}: ReturnType<typeof HostApplications.fetch.individual.start>): SagaIterator {
  yield put(HostApplications.fetch.individual.started(id));

  try {
    const accessToken: string | null = yield select(getAccessToken);
    const result: HostApplicationDetails = yield call(
      fetchHostApplicationDetails,
      id,
      accessToken ?? 'NO ACCESS TOKEN',
    );

    yield put(HostApplications.fetch.individual.completed(result));
  } catch (err) {
    const error = new FetchHostingApplicationError(id, err);
    console.error(error);
    yield put(HostApplications.fetch.individual.completed.failed(error));
  }
}

export class ReviewHostingApplicationError extends GenericError {
  constructor(
    public id: number,
    public cause: unknown,
  ) {
    super(`Failed to review host application '${id}'`, cause);
  }
}

function* reviewHostingApplicationDetailsSaga({
  payload: { id, status, rejectReason, onSuccess },
}: ReturnType<typeof HostApplications.respond.start>): SagaIterator {
  yield put(HostApplications.respond.started({ id, status, rejectReason }));

  try {
    const accessToken: string | null = yield select(getAccessToken);
    yield call(reviewHostApplication, id, status, accessToken ?? 'NO ACCESS TOKEN', rejectReason);

    yield put(HostApplications.respond.completed({ id, status, rejectReason }));
    // refresh list to have the response show up immediately
    yield put(HostApplications.fetch.list.start());
    onSuccess();
  } catch (err) {
    const error = new ReviewHostingApplicationError(id, err);
    console.error(error);
    yield put(HostApplications.respond.completed.failed(error));
    yield call(showToast, { message: 'Error responding to application', intent: Intent.DANGER });
  }
}

export class CreateHostingApplicationError extends GenericError {
  constructor(public cause: unknown) {
    super(`Failed to create host application`, cause);
  }
}

function* createHostingApplicationSaga({
  payload: { data },
}: ReturnType<typeof HostApplications.create.start>): SagaIterator {
  yield put(HostApplications.create.started(data));

  try {
    const accessToken: string | null = yield select(getAccessToken);
    yield call(createHostApplication, data, accessToken ?? 'NO ACCESS TOKEN');

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
