import { ApiErrors, HostingRulesApi } from '../api';
import { SagaIterator, effects } from 'redux-saga';
import { GetHostingRules, SetHostingRules } from '../actions';
import { getAccessToken, getUsername } from '../state/Selectors';
import { Action } from 'redux-actions';
import { HostingRules } from '../state/HostingRulesState';
import * as moment from 'moment-timezone';
import { AppToaster } from '../AppToaster';
import { Intent } from '@blueprintjs/core';

function* getHostingRulesSaga(): SagaIterator {
  try {
    yield effects.put(GetHostingRules.started());

    const rules: HostingRules = yield effects.call(HostingRulesApi.fetchHostingRules);

    yield effects.put(GetHostingRules.success({ result: rules }));
  } catch (error) {
    console.log(error, 'error getting hosting rules');
    yield effects.put(GetHostingRules.failure({ error }));
  }
}

function* setHostingRulesSaga(action: Action<string>): SagaIterator {
  const parameters = action.payload!;

  try {
    const username: string | null = yield effects.select(getUsername);
    const accessToken: string | null = yield effects.select(getAccessToken);

    if (!username || !accessToken) {
      throw new ApiErrors.NotAuthenticatedError();
    }

    const rules: HostingRules = {
      content: parameters,
      modified: moment.utc(),
      author: username,
    };

    yield effects.put(SetHostingRules.started({ parameters, result: rules }));
    yield effects.call(HostingRulesApi.callSetHostingRules, parameters, accessToken);
    yield effects.put(SetHostingRules.success({ parameters, result: rules }));

    AppToaster.show({
      intent: Intent.SUCCESS,
      iconName: 'tick',
      message: `Updated hosting rules`,
    });
  } catch (error) {
    console.log(error, 'error setting hosting rules');
    yield effects.put(SetHostingRules.failure({ parameters, error }));
    AppToaster.show({
      intent: Intent.DANGER,
      iconName: 'warning-sign',
      message: error instanceof ApiErrors.BadDataError
        ? `Failed to update hosting rules: ${error.message}`
        : `Failed to update hosting rules`,
    });
  }
}

export function* watchHostingRules(): SagaIterator {
  yield effects.all([
    effects.takeLatest<Action<void>>(GetHostingRules.start, getHostingRulesSaga),
    effects.takeLatest<Action<string>>(SetHostingRules.start, setHostingRulesSaga),
  ]);
}
