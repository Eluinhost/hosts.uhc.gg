import { createReducer } from 'typesafe-redux-helpers';
import { Reducer } from 'redux';
import moment from 'moment-timezone';
import { concat } from 'ramda';

import { Match } from '../models/Match';
import { ApiErrors } from '../api';
import { LoadHostHistory, ApproveMatch, RemoveMatch } from '../actions';

export type HostHistoryState = {
  readonly fetching: boolean;
  readonly error: string | null;
  readonly matches: Match[];
  readonly host: string | null;
  readonly hasMorePages: boolean;
  readonly updated: moment.Moment | null;
};

const displayError = (err: Error) => {
  if (err instanceof ApiErrors.NotAuthenticatedError) return 'You are not logged in';

  if (err instanceof ApiErrors.ForbiddenError) return 'You do not have permissions to do this';

  return 'Unexpected response from the server';
};

export const reducer: Reducer<HostHistoryState> = createReducer<HostHistoryState>({
  fetching: false,
  error: null,
  matches: [],
  host: null,
  hasMorePages: true,
  updated: null,
})
  .handleAction(LoadHostHistory.clear, () => ({
    fetching: false,
    error: null,
    matches: [],
    host: null,
    hasMorePages: false,
    updated: null,
  }))
  .handleAction(LoadHostHistory.started, (state, action) => ({
    fetching: true,
    error: null,
    host: action.payload.parameters.host,
    matches: state.matches,
    hasMorePages: state.hasMorePages,
    updated: state.updated,
  }))
  .handleAction(LoadHostHistory.success, (state, action) => ({
    fetching: false,
    error: null,
    matches: concat(state.matches, action.payload.result),
    host: state.host,
    hasMorePages: action.payload!.result.length > 0,
    updated: moment.utc(),
  }))
  .handleAction(LoadHostHistory.failure, (state, action) => ({
    fetching: false,
    error: displayError(action.payload.error),
    matches: state.matches,
    host: state.host,
    hasMorePages: state.hasMorePages,
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
        remvoedReason: action.payload.parameters.reason,
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
        remvoedReason: null,
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
