import type { SagaIterator } from 'redux-saga';
import { fork } from 'redux-saga/effects';

import { authentication } from './authentication';

export default function* rootSaga(): SagaIterator {
  yield fork(authentication);
}
