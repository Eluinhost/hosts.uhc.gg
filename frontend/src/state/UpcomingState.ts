import type { Reducer } from 'redux';
import { createReducer } from 'typesafe-redux-helpers';

import { ApproveMatch, UpdateUpcoming } from '../actions';
import { ApiErrors } from '../api';
import dayjs, { type Dayjs } from '../dayjs';
import type { Match } from '../models/Match';

export type UpcomingState = {
  readonly matches: Match[];
  readonly fetching: boolean;
  readonly error: string | null;
  readonly updated: Dayjs | null;
};

const displayError = (err: Error) => {
  if (err instanceof ApiErrors.NotAuthenticatedError) return 'You are not logged in';

  if (err instanceof ApiErrors.ForbiddenError) return 'You do not have permissions to do this';

  return 'Unexpected response from the server';
};

export const reducer: Reducer<UpcomingState> = createReducer<UpcomingState>({
  matches: [],
  fetching: false,
  error: null,
  updated: null,
})
  .handleAction(UpdateUpcoming.started, state => ({
    fetching: true,
    error: null,
    matches: state.matches,
    updated: state.updated,
  }))
  .handleAction(UpdateUpcoming.success, (_state, action) => ({
    fetching: false,
    matches: action.payload.result,
    error: null,
    updated: dayjs.utc(),
  }))
  .handleAction(UpdateUpcoming.failure, (state, action) => ({
    fetching: false,
    error: displayError(action.payload.error),
    matches: state.matches,
    updated: state.updated,
  }))
  .handleAction(ApproveMatch.started, (state, action) => ({
    ...state,
    matches: state.matches.map(match => {
      if (match.id !== action.payload.parameters.id) return match;

      return {
        ...match,
        approvedBy: action.payload.result.username,
      };
    }),
  }))
  .handleAction(ApproveMatch.failure, (state, action) => ({
    ...state,
    matches: state.matches.map(match => {
      if (match.id !== action.payload.parameters.id) return match;

      return {
        ...match,
        approvedBy: null,
      };
    }),
  }));
