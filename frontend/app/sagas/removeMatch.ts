import { BadDataError, removeMatch as removeApiCall } from '../api';
import { SagaIterator, effects } from 'redux-saga';
import { ApproveMatch, RemoveMatch, RemoveMatchParameters } from '../actions';
import { getAccessToken, getUsername } from '../state/Selectors';
import { ApplicationState } from '../state/ApplicationState';
import { Action } from 'redux-actions';
import { startSubmit, stopSubmit, SubmissionError } from 'redux-form';
import { AppToaster } from '../AppToaster';
import { Intent } from '@blueprintjs/core';

function* removeMatchSaga(action: Action<RemoveMatchParameters>): SagaIterator {
  const parameters = action.payload!;

  try {
    const state: ApplicationState = yield effects.select();
    const token = getAccessToken(state) || 'NO ACCESS TOKEN IN STATE';
    const username = getUsername(state) || 'NO USERNAME IN STATE';

    yield effects.put(RemoveMatch.started({
      parameters,
      result: {
        username,
      },
    }));
    yield effects.put(startSubmit(RemoveMatch.formId));
    yield effects.call(removeApiCall, parameters.id, parameters.reason, token);
    yield effects.put(stopSubmit(RemoveMatch.formId));
    yield effects.put(RemoveMatch.success({ parameters }));
    yield effects.put(RemoveMatch.closeDialog());

    AppToaster.show({
      intent: Intent.SUCCESS,
      iconName: 'tick',
      message: `Removed match #${parameters.id}`,
    });

  } catch (error) {
    console.log(error, 'error removing match');

    if (error instanceof SubmissionError) {
      yield effects.put(stopSubmit(RemoveMatch.formId, error.errors));
    } else {
      yield effects.put(stopSubmit(RemoveMatch.formId, { _error: 'Unexpected error' }));
    }

    yield effects.put(RemoveMatch.failure({ parameters, error }));

    AppToaster.show({
      intent: Intent.DANGER,
      iconName: 'warning-sign',
      message: error instanceof BadDataError
        ? error.message
        : `Failed to remove match #${parameters.id}`,
    });
  }
}

export function* watchRemoveMatch(): SagaIterator {
  yield effects.takeEvery<Action<RemoveMatchParameters>>(RemoveMatch.start, removeMatchSaga);
}
