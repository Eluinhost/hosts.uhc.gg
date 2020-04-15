import { createReducer } from 'typesafe-redux-helpers';

import { Version } from './Version';
import { FETCH_VERSIONS } from './actions';
import { FetchVersionsError } from './sagas';

export type ListVersionsState = {
  isFetching: boolean;
  error: FetchVersionsError | null;
  data: Version[];
};

export type VersionsState = {
  list: ListVersionsState;
};

const listVersionsReducer = createReducer<ListVersionsState>({
  isFetching: false,
  error: null,
  data: [],
})
  .handleAction(FETCH_VERSIONS.STARTED, () => ({
    isFetching: true,
    error: null,
    data: [],
  }))
  .handleAction(
    FETCH_VERSIONS.COMPLETED,
    (state, action) => ({
      isFetching: false,
      error: null,
      data: action.payload.available,
    }),
    (state, action) => ({
      isFetching: false,
      error: action.payload as FetchVersionsError,
      data: [],
    }),
  );

export const reducer = createReducer<VersionsState>({
  list: {
    isFetching: false,
    error: null,
    data: [],
  },
}).forProperty('list', listVersionsReducer);
