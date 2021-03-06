import { createReducer } from 'typesafe-redux-helpers';
import { Reducer } from 'redux';
import moment from 'moment-timezone';

import { Match } from '../models/Match';
import { ApiErrors } from '../api';
import { ApproveMatch, RemoveMatch, UpdateUpcoming } from '../actions';

export type UpcomingState = {
  readonly matches: Match[];
  readonly fetching: boolean;
  readonly error: string | null;
  readonly updated: moment.Moment | null;
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
  .handleAction(UpdateUpcoming.success, (state, action) => ({
    fetching: false,
    matches: action.payload.result,
    error: null,
    updated: moment.utc(),
  }))
  .handleAction(UpdateUpcoming.failure, (state, action) => ({
    fetching: false,
    error: displayError(action.payload.error),
    matches: state.matches,
    updated: state.updated,
  }))
  .handleAction(RemoveMatch.started, (state, action) => ({
    ...state,
    matches: state.matches.map(match => {
      if (match.id !== action.payload.parameters.id) return match;

      return {
        ...match,
        removed: true,
        removedBy: action.payload.result.username,
        removedReason: action.payload.parameters.reason,
      };
    }),
  }))
  .handleAction(RemoveMatch.failure, (state, action) => ({
    ...state,
    matches: state.matches.map(match => {
      if (match.id !== action.payload.parameters.id) return match;

      return {
        ...match,
        removed: false,
        removedBy: null,
        removedReason: null,
      };
    }),
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
