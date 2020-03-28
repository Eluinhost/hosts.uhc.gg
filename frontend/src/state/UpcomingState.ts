import { ApplicationReducer, ReducerBuilder } from './ReducerBuilder';
import { Match } from '../models/Match';
import { ApiErrors } from '../api';
import { ApproveMatch, RemoveMatch, UpdateUpcoming } from '../actions';
import moment from 'moment-timezone';

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

export const reducer: ApplicationReducer<UpcomingState> = ReducerBuilder.withInitialState<UpcomingState>({
  matches: [],
  fetching: false,
  error: null,
  updated: null,
})
  .handle(UpdateUpcoming.started, (prev, action) => ({
    fetching: true,
    error: null,
    matches: prev.matches,
    updated: prev.updated,
  }))
  .handle(UpdateUpcoming.success, (prev, action) => ({
    fetching: false,
    matches: action.payload!.result,
    error: null,
    updated: moment.utc(),
  }))
  .handle(UpdateUpcoming.failure, (prev, action) => ({
    fetching: false,
    error: displayError(action.payload!.error),
    matches: prev.matches,
    updated: prev.updated,
  }))
  .handle(RemoveMatch.started, (prev, action) => ({
    ...prev,
    matches: prev.matches.map(match => {
      if (match.id !== action.payload!.parameters.id) return match;

      return {
        ...match,
        removed: true,
        removedBy: action.payload!.result.username,
        removedReason: action.payload!.parameters.reason,
      };
    }),
  }))
  .handle(RemoveMatch.failure, (prev, action) => ({
    ...prev,
    matches: prev.matches.map(match => {
      if (match.id !== action.payload!.parameters.id) return match;

      return {
        ...match,
        removed: false,
        removedBy: null,
        removedReason: null,
      };
    }),
  }))
  .handle(ApproveMatch.started, (prev, action) => ({
    ...prev,
    matches: prev.matches.map(match => {
      if (match.id !== action.payload!.parameters.id) return match;

      return {
        ...match,
        approvedBy: action.payload!.result.username,
      };
    }),
  }))
  .handle(ApproveMatch.failure, (prev, action) => ({
    ...prev,
    matches: prev.matches.map(match => {
      if (match.id !== action.payload!.parameters.id) return match;

      return {
        ...match,
        approvedBy: null,
      };
    }),
  }))
  .build();
