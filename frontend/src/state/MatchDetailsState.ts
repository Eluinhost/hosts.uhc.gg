import { createReducer } from 'typesafe-redux-helpers';
import { Reducer } from 'redux';
import moment from 'moment-timezone';

import { Match } from '../models/Match';
import { ApiErrors } from '../api';
import { ApproveMatch, FetchMatchDetails, RemoveMatch } from '../actions';

export type MatchDetailsState = {
  readonly match: Match | null;
  readonly fetching: boolean;
  readonly error: string | null;
  readonly updated: moment.Moment | null;
};

const displayError = (err: Error) => {
  if (err instanceof ApiErrors.NotAuthenticatedError) return 'You are not logged in';

  if (err instanceof ApiErrors.ForbiddenError) return 'You do not have permissions to do this';

  return 'Unexpected response from the server';
};

export const reducer: Reducer<MatchDetailsState> = createReducer<MatchDetailsState>({
  match: null,
  fetching: false,
  error: null,
  updated: null,
})
  .handleAction(FetchMatchDetails.started, state => ({
    fetching: true,
    error: null,
    match: null,
    updated: state.updated,
  }))
  .handleAction(FetchMatchDetails.success, (state, action) => ({
    fetching: false,
    error: null,
    match: action.payload.result,
    updated: moment.utc(),
  }))
  .handleAction(FetchMatchDetails.failure, (state, action) => ({
    fetching: false,
    error: displayError(action.payload.error),
    match: null,
    updated: moment.utc(),
  }))
  .handleAction(FetchMatchDetails.clear, state => ({
    match: null,
    updated: null,
    error: state.error,
    fetching: state.fetching,
  }))
  .handleAction(RemoveMatch.started, (state, action) => {
    if (!state.match || action.payload.parameters.id !== state.match.id) return state;

    return {
      ...state,
      match: {
        ...state.match,
        removed: true,
        removedBy: action.payload.result.username,
        removedReason: action.payload.parameters.reason,
      },
    };
  })
  .handleAction(RemoveMatch.failure, (state, action) => {
    if (!state.match || action.payload.parameters.id !== state.match.id) return state;

    return {
      ...state,
      match: {
        ...state.match,
        removed: false,
        removedBy: null,
        removedReason: null,
      },
    };
  })
  .handleAction(ApproveMatch.started, (state, action) => {
    if (!state.match || action.payload.parameters.id !== state.match.id) return state;

    return {
      ...state,
      match: {
        ...state.match,
        approvedBy: action.payload.result.username,
      },
    };
  })
  .handleAction(ApproveMatch.failure, (state, action) => {
    if (!state.match || action.payload.parameters.id !== state.match.id) return state;

    return {
      ...state,
      match: {
        ...state.match,
        approvedBy: null,
      },
    };
  });
