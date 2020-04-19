import { SagaIterator } from 'redux-saga';
import { takeLatest, put, select, takeEvery, all, race, take, call } from 'redux-saga/effects';
import { actionTypes, change, getFormValues, SubmissionError } from 'redux-form';
import { AnyAction } from 'redux';
import { push } from 'connected-react-router';

import { FETCH_VERSIONS } from '../../versions/actions';
import { isSuccessfulAction, PayloadAction } from 'typesafe-redux-helpers';
import { Version } from '../../versions/Version';
import { CreateMatchData } from '../../models/CreateMatchData';
import { HostFormConflicts } from '../../actions';
import { renderToMarkdown } from './TemplateField';
import { TeamStyles } from '../../models/TeamStyles';
import { ApiErrors, MatchesApi } from '../../api';
import { createTemplateContext } from './createTemplateContext';
import { getAccessToken, getUsername } from '../../state/Selectors';
import { formKey } from './formKey';

export function* fixHostFormVersionOnVersionsUpdate(): SagaIterator {
  yield takeLatest(FETCH_VERSIONS.COMPLETED, function* (action: PayloadAction<{ available: Version[] }>) {
    if (!isSuccessfulAction(action)) {
      return;
    }

    const data: CreateMatchData = yield select(getFormValues(formKey));

    // if the current selected version doesn't exist in the response default to the first version
    if (data && action.payload.available.findIndex(a => a.displayName === data.mainVersion) === -1) {
      yield put(change(formKey, 'mainVersion', action.payload.available[0].displayName, true));
    }
  });
}

export function* removeVanillaPlusWhenOtherScenarioAdded(): SagaIterator {
  yield takeEvery(actionTypes.CHANGE, function* (action: AnyAction): SagaIterator {
    if (action.meta.form !== formKey || action.meta.field !== 'scenarios') {
      return;
    }

    const items: string[] = action.payload;

    if (items.length === 0) {
      yield put(change(formKey, 'scenarios', ['Vanilla+'], true));
      return;
    }

    if (items.length > 1 && items.some(item => item.toLowerCase() === 'vanilla+')) {
      yield put(
        change(
          formKey,
          'scenarios',
          items.filter(item => item.toLowerCase() !== 'vanilla+'),
          true,
        ),
      );
    }
  });
}

export function* checkForConflicts(values: CreateMatchData): SagaIterator<void> {
  const {
    result: { success, failure },
  } = yield all({
    start: put(HostFormConflicts.start({ data: values })),
    result: race({
      success: take(HostFormConflicts.success),
      failure: take(HostFormConflicts.failure),
    }),
  });

  if (failure) {
    throw new SubmissionError<CreateMatchData>({
      opens: 'Failed to lookup conflicts',
      region: 'Failed to lookup conflicts',
      tournament: 'Failed to lookup conflicts',
      mainVersion: 'Failed to lookup conflicts',
    });
  }

  const payload: NonNullable<ReturnType<typeof HostFormConflicts.success>['payload']> = success.payload;

  let confirmedConflicts = payload.result.filter(conflict => conflict.opens.isSame(payload.parameters.data.opens));

  // If the game being hosted is not a tournament it is allowed to overhost tournaments
  if (!payload.parameters.data.tournament) {
    confirmedConflicts = confirmedConflicts.filter(conflict => !conflict.tournament);
  }

  if (confirmedConflicts.length) {
    // conflict should be whatever isn't a tournament, if they're all tournaments just return whatever is first
    const conflict = confirmedConflicts.find(m => !m.tournament) || confirmedConflicts[0];

    // tslint:disable-next-line:max-line-length
    const message = `Conflicts with /u/${conflict.author}'s #${conflict.count} (${
      conflict.region
    } - ${conflict.opens.format('HH:mm z')})`;

    throw new SubmissionError<CreateMatchData>({
      opens: message,
      region: message,
    });
  }
}

export function* createMatch(values: CreateMatchData): SagaIterator {
  const username: string = yield select(getUsername);

  // we convert the template to markdown only, we don't want to send HTML
  const context: any = yield call(createTemplateContext, values, username);
  const renderedContent: string = yield call(renderToMarkdown, values.content, context);

  const withRenderedTemplate: CreateMatchData = {
    ...values,
    content: renderedContent,
  };

  // Remove the team size if it isn't required to avoid potential non-ints being sent and rejected at decoding
  if (!TeamStyles.find(it => it.value === values.teams)!.requiresTeamSize) {
    withRenderedTemplate.size = null;
  }

  try {
    const accessToken = yield select(getAccessToken) || 'NO ACCESS TOKEN IN STORE';

    // fire API call
    yield call(MatchesApi.create, withRenderedTemplate, accessToken);

    // if success send them to the matches page to view it
    yield put(push('/matches'));
  } catch (err) {
    if (err instanceof ApiErrors.BadDataError) throw new SubmissionError({ _error: `Bad data: ${err.message}` });

    if (err instanceof ApiErrors.NotAuthenticatedError) {
      // User cookie has expired, get them to reauthenticate
      window.location.href = '/authenticate?path=/host';
      return;
    }

    if (err instanceof ApiErrors.ForbiddenError) {
      throw new SubmissionError({ _error: 'You no longer have hosting permission' });
    }

    throw new SubmissionError({ _error: 'Unexpected server issue, please contact an admin if this persists' });
  }
}
