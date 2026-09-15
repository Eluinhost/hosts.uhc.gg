import { AnyAction } from 'redux';
import { actionTypes, change, getFormValues } from 'redux-form';
import { SagaIterator } from 'redux-saga';
import { takeLatest, put, select, takeEvery } from 'redux-saga/effects';
import { isSuccessfulAction, PayloadAction } from 'typesafe-redux-helpers';

import { CreateMatchData } from '../../models/CreateMatchData';
import { FETCH_VERSIONS } from '../../versions/actions';

import { formKey } from './index';

export function* fixHostFormVersionOnVersionsUpdate(): SagaIterator {
  yield takeLatest(FETCH_VERSIONS.COMPLETED, function* (action: PayloadAction<{ available: Array<string> }>) {
    if (!isSuccessfulAction(action)) {
      return;
    }

    const data: CreateMatchData = yield select(getFormValues(formKey));

    // if the current selected version doesn't exist in the response default to the first version
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (data && action.payload.available.findIndex(a => a === data.mainVersion) === -1) {
      yield put(change(formKey, 'mainVersion', action.payload.available[0], true));
    }
  });
}

export function* removeVanillaPlusWhenOtherScenarioAdded(): SagaIterator {
  yield takeEvery(actionTypes.CHANGE, function* (action: AnyAction): SagaIterator {
    // no type for change action to type meta field/form
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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
