import { MatchesApi, ApiErrors } from '../api';
import { SagaIterator, effects } from 'redux-saga';
import { ApproveMatch, ApproveMatchParameters } from '../actions';
import { getAccessToken, getUsername } from '../state/Selectors';
import { ApplicationState } from '../state/ApplicationState';
import { Action } from 'redux-actions';
import { AppToaster } from '../services/AppToaster';
import { Intent } from '@blueprintjs/core';

function* approveMatchSaga(action: Action<ApproveMatchParameters>): SagaIterator {
  const parameters = action.payload!;

  try {
    const state: ApplicationState = yield effects.select();
    const token = getAccessToken(state) || 'NO ACCESS TOKEN IN STATE';
    const username = getUsername(state) || 'NO USERNAME IN STATE';

    yield effects.put(ApproveMatch.started({
      parameters,
      result: {
        username,
      },
    }));
    yield effects.call(MatchesApi.callApprove, parameters.id, token);
    yield effects.put(ApproveMatch.success({ parameters }));
    yield effects.put(ApproveMatch.closeDialog());

    AppToaster.show({
      intent: Intent.SUCCESS,
      iconName: 'tick',
      message: `Approved match #${parameters.id}`,
    });
  } catch (error) {
    console.error(error, 'error approving match');
    yield effects.put(ApproveMatch.failure({ parameters, error }));

    AppToaster.show({
      intent: Intent.DANGER,
      iconName: 'warning-sign',
      message: error instanceof ApiErrors.BadDataError
        ? error.message
        : `Failed to approve match #${parameters.id}`,
    });
  }
}

export function* watchApproveMatch(): SagaIterator {
  yield effects.takeEvery<Action<ApproveMatchParameters>>(ApproveMatch.start, approveMatchSaga);
}
