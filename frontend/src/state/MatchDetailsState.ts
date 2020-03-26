import { ApplicationReducer, ReducerBuilder } from './ReducerBuilder';
import { Match } from '../models/Match';
import { ApiErrors } from '../api';
import { ApproveMatch, FetchMatchDetails, RemoveMatch } from '../actions';
import * as moment from 'moment';

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

export const reducer: ApplicationReducer<MatchDetailsState> = ReducerBuilder.withInitialState<MatchDetailsState>({
  match: null,
  fetching: false,
  error: null,
  updated: null,
})
  .handle(FetchMatchDetails.started, (prev, action) => ({
    fetching: true,
    error: null,
    match: null,
    updated: prev.updated,
  }))
  .handle(FetchMatchDetails.success, (prev, action) => ({
    fetching: false,
    error: null,
    match: action.payload!.result,
    updated: moment.utc(),
  }))
  .handle(FetchMatchDetails.failure, (prev, action) => ({
    fetching: false,
    error: displayError(action.payload!.error),
    match: null,
    updated: moment.utc(),
  }))
  .handle(FetchMatchDetails.clear, (prev, action) => ({
    match: null,
    updated: null,
    error: prev.error,
    fetching: prev.fetching,
  }))
  .handle(RemoveMatch.started, (prev, action) => {
    if (!prev.match || action.payload!.parameters.id !== prev.match.id) return prev;

    return {
      ...prev,
      match: {
        ...prev.match,
        removed: true,
        removedBy: action.payload!.result.username,
        removedReason: action.payload!.parameters.reason,
      },
    };
  })
  .handle(RemoveMatch.failure, (prev, action) => {
    if (!prev.match || action.payload!.parameters.id !== prev.match.id) return prev;

    return {
      ...prev,
      match: {
        ...prev.match,
        removed: false,
        removedBy: null,
        removedReason: null,
      },
    };
  })
  .handle(ApproveMatch.started, (prev, action) => {
    if (!prev.match || action.payload!.parameters.id !== prev.match.id) return prev;

    return {
      ...prev,
      match: {
        ...prev.match,
        approvedBy: action.payload!.result.username,
      },
    };
  })
  .handle(ApproveMatch.failure, (prev, action) => {
    if (!prev.match || action.payload!.parameters.id !== prev.match.id) return prev;

    return {
      ...prev,
      match: {
        ...prev.match,
        approvedBy: null,
      },
    };
  })
  .build();
