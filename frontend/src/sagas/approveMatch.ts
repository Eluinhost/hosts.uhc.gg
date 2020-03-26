import { MatchesApi, ApiErrors } from '../api';
import { SagaIterator } from 'redux-saga';
import { select, put, call, takeEvery } from 'redux-saga/effects';
import { ApproveMatch, ApproveMatchParameters } from '../actions';
import { getAccessToken, getUsername } from '../state/Selectors';
import { ApplicationState } from '../state/ApplicationState';
import { Action } from 'redux-actions';
import { AppToaster } from '../services/AppToaster';
import { Intent } from '@blueprintjs/core';

function* approveMatchSaga(action: Action<ApproveMatchParameters>): SagaIterator {
  const parameters = action.payload!;

  try {
    const state: ApplicationState = yield select();
    const token = getAccessToken(state) || 'NO ACCESS TOKEN IN STATE';
    const username = getUsername(state) || 'NO USERNAME IN STATE';

    yield put(
      ApproveMatch.started({
        parameters,
        result: {
          username,
        },
      }),
    );
    yield call(MatchesApi.callApprove, parameters.id, token);
    yield put(ApproveMatch.success({ parameters }));
    yield put(ApproveMatch.closeDialog());

    AppToaster.show({
      intent: Intent.SUCCESS,
      icon: 'tick',
      message: `Approved match #${parameters.id}`,
    });
  } catch (error) {
    console.error(error, 'error approving match');
    yield put(ApproveMatch.failure({ parameters, error }));

    AppToaster.show({
      intent: Intent.DANGER,
      icon: 'warning-sign',
      message: error instanceof ApiErrors.BadDataError ? error.message : `Failed to approve match #${parameters.id}`,
    });
  }
}

export function* watchApproveMatch(): SagaIterator {
  yield takeEvery<Action<ApproveMatchParameters>>(ApproveMatch.start, approveMatchSaga);
}
