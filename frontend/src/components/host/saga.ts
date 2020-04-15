import { SagaIterator } from 'redux-saga';
import { takeLatest, put, select } from 'redux-saga/effects';
import { change, getFormValues } from 'redux-form';

import { FETCH_VERSIONS } from '../../versions/actions';
import { isSuccessfulAction, PayloadAction } from 'typesafe-redux-helpers';
import { Version } from '../../versions/Version';
import { formKey } from './index';
import { CreateMatchData } from '../../models/CreateMatchData';

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
