import { createReducer } from 'typesafe-redux-helpers';

import { Match } from '../models/Match';
import { FETCH_MATCH_EDIT_HISTORY } from './actions';

export interface MatchEditHistoryState {
  isFetching: boolean;
  error: any | null;
  forId: number | null;
  data: Match[];
}

export const reducer = createReducer<MatchEditHistoryState>({
  isFetching: false,
  error: null,
  forId: null,
  data: [],
})
  .handleAction(FETCH_MATCH_EDIT_HISTORY.STARTED, (state, action) => ({
    isFetching: true,
    error: null,
    forId: action.payload.id,
    data: [],
  }))
  .handleAction(
    FETCH_MATCH_EDIT_HISTORY.COMPLETED,
    (state, action) => ({
      isFetching: false,
      error: null,
      data: action.payload.history,
      forId: state.forId,
    }),
    (state, action) => ({
      isFetching: false,
      error: action.payload,
      forId: state.forId,
      data: [],
    }),
  );
