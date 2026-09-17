import { Intent } from '@blueprintjs/core';
import { TickIcon, WarningSignIcon } from '@blueprintjs/icons';
import { createElement } from 'react';
import { startSubmit, stopSubmit, SubmissionError } from 'redux-form';
import type { SagaIterator } from 'redux-saga';
import { put, call, select, takeEvery } from 'redux-saga/effects';

import { RemoveMatch } from '../actions';
import { ApiErrors, MatchesApi } from '../api';
import { showToast } from '../services/AppToaster';
import type { ApplicationState } from '../state/ApplicationState';
import { getAccessToken, getUsername } from '../state/Selectors';
import { wrapError } from '../utils/wrapError';

function* removeMatchSaga(action: ReturnType<typeof RemoveMatch.start>): SagaIterator {
  const parameters = action.payload;

  try {
    const state: ApplicationState = yield select();
    const token = getAccessToken(state) || 'NO ACCESS TOKEN IN STATE';
    const username = getUsername(state) || 'NO USERNAME IN STATE';

    yield put(
      RemoveMatch.started({
        parameters,
        result: {
          username,
        },
      }),
    );
    yield put(startSubmit(RemoveMatch.formId));
    yield call(MatchesApi.callRemove, parameters.id, parameters.reason, token);
    yield put(stopSubmit(RemoveMatch.formId));
    yield put(RemoveMatch.success({ parameters }));
    yield put(RemoveMatch.closeDialog());

    yield call(showToast, {
      intent: Intent.SUCCESS,
      icon: createElement(TickIcon),
      message: `Removed match #${parameters.id}`,
    });
  } catch (error) {
    console.error(error, 'error removing match');

    if (error instanceof SubmissionError) {
      yield put(stopSubmit(RemoveMatch.formId, error.errors));
    } else {
      yield put(stopSubmit(RemoveMatch.formId, { _error: 'Unexpected error' }));
    }

    yield put(RemoveMatch.failure({ parameters, error: wrapError(error) }));

    yield call(showToast, {
      intent: Intent.DANGER,
      icon: createElement(WarningSignIcon),
      message: error instanceof ApiErrors.BadDataError ? error.message : `Failed to remove match #${parameters.id}`,
    });
  }
}

export function* watchRemoveMatch(): SagaIterator {
  yield takeEvery(RemoveMatch.start, removeMatchSaga);
}
