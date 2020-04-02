import { ApiErrors, HostingRulesApi } from '../api';
import { SagaIterator } from 'redux-saga';
import { call, put, select, all, takeLatest } from 'redux-saga/effects';
import { GetHostingRules, SetHostingRules } from '../actions';
import { getAccessToken, getUsername } from '../state/Selectors';
import { HostingRules } from '../state/HostingRulesState';
import moment from 'moment-timezone';
import { AppToaster } from '../services/AppToaster';
import { Intent } from '@blueprintjs/core';

function* getHostingRulesSaga(): SagaIterator {
  try {
    yield put(GetHostingRules.started());

    const rules: HostingRules = yield call(HostingRulesApi.fetchHostingRules);

    yield put(GetHostingRules.success({ result: rules }));
  } catch (error) {
    console.error(error, 'error getting hosting rules');
    yield put(GetHostingRules.failure({ error }));
  }
}

function* setHostingRulesSaga(action: ReturnType<typeof SetHostingRules.start>): SagaIterator {
  try {
    const username: string | null = yield select(getUsername);
    const accessToken: string | null = yield select(getAccessToken);

    if (!username || !accessToken) {
      throw new ApiErrors.NotAuthenticatedError();
    }

    const rules: HostingRules = {
      content: action.payload,
      modified: moment.utc(),
      author: username,
    };

    yield put(SetHostingRules.started({ parameters: action.payload, result: rules }));
    yield call(HostingRulesApi.callSetHostingRules, action.payload, accessToken);
    yield put(SetHostingRules.success({ parameters: action.payload, result: rules }));

    AppToaster.show({
      intent: Intent.SUCCESS,
      icon: 'tick',
      message: `Updated hosting rules`,
    });
  } catch (error) {
    console.error(error, 'error setting hosting rules');
    yield put(SetHostingRules.failure({ parameters: action.payload, error }));
    AppToaster.show({
      intent: Intent.DANGER,
      icon: 'warning-sign',
      message:
        error instanceof ApiErrors.BadDataError
          ? `Failed to update hosting rules: ${error.message}`
          : `Failed to update hosting rules`,
    });
  }
}

export function* watchHostingRules(): SagaIterator {
  yield all([
    takeLatest(GetHostingRules.start, getHostingRulesSaga),
    takeLatest(SetHostingRules.start, setHostingRulesSaga),
  ]);
}
