import { MatchesApi, ApiErrors } from '../api';
import { SagaIterator } from 'redux-saga';
import { select, put, call, takeEvery } from 'redux-saga/effects';
import { ApproveMatch } from '../actions';
import { getAccessToken, getUsername } from '../state/Selectors';
import { ApplicationState } from '../state/ApplicationState';
import { AppToaster } from '../services/AppToaster';
import { Intent } from '@blueprintjs/core';

function* approveMatchSaga(action: ReturnType<typeof ApproveMatch.start>): SagaIterator {
  try {
    const state: ApplicationState = yield select();
    const token = getAccessToken(state) || 'NO ACCESS TOKEN IN STATE';
    const username = getUsername(state) || 'NO USERNAME IN STATE';

    yield put(
      ApproveMatch.started({
        parameters: action.payload,
        result: {
          username,
        },
      }),
    );
    yield call(MatchesApi.callApprove, action.payload.id, token);
    yield put(ApproveMatch.success({ parameters: action.payload }));
    yield put(ApproveMatch.closeDialog());

    AppToaster.show({
      intent: Intent.SUCCESS,
      icon: 'tick',
      message: `Approved match #${action.payload.id}`,
    });
  } catch (error) {
    console.error(error, 'error approving match');
    yield put(ApproveMatch.failure({ parameters: action.payload, error }));

    AppToaster.show({
      intent: Intent.DANGER,
      icon: 'warning-sign',
      message:
        error instanceof ApiErrors.BadDataError ? error.message : `Failed to approve match #${action.payload.id}`,
    });
  }
}

export function* watchApproveMatch(): SagaIterator {
  yield takeEvery(ApproveMatch.start, approveMatchSaga);
}
