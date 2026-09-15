import { Intent } from '@blueprintjs/core';
import { TickIcon, WarningSignIcon } from '@blueprintjs/icons';
import { createElement } from 'react';
import type { SagaIterator } from 'redux-saga';
import { select, put, call, takeEvery } from 'redux-saga/effects';

import { ApproveMatch } from '../actions';
import { MatchesApi, ApiErrors } from '../api';
import { showToast } from '../services/AppToaster';
import type { ApplicationState } from '../state/ApplicationState';
import { getAccessToken, getUsername } from '../state/Selectors';
import { wrapError } from '../utils/wrapError';

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

    yield call(showToast, {
      intent: Intent.SUCCESS,
      icon: createElement(TickIcon),
      message: `Approved match #${action.payload.id}`,
    });
  } catch (error) {
    console.error(error, 'error approving match');
    yield put(ApproveMatch.failure({ parameters: action.payload, error: wrapError(error) }));

    yield call(showToast, {
      intent: Intent.DANGER,
      icon: createElement(WarningSignIcon),
      message:
        error instanceof ApiErrors.BadDataError ? error.message : `Failed to approve match #${action.payload.id}`,
    });
  }
}

export function* watchApproveMatch(): SagaIterator {
  yield takeEvery(ApproveMatch.start, approveMatchSaga);
}
