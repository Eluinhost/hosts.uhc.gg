import { ApplicationReducer, ReducerBuilder } from './ReducerBuilder';
import { Match } from '../models/Match';
import { ApiErrors } from '../api';
import { concat } from 'ramda';
import { LoadHostHistory, ApproveMatch, RemoveMatch } from '../actions';

export type HostHistoryState = {
  readonly fetching: boolean;
  readonly error: string | null;
  readonly matches: Match[];
  readonly host: string | null;
  readonly hasMorePages: boolean;
};

const displayError = (err: Error) => {
  if (err instanceof ApiErrors.NotAuthenticatedError)
    return 'You are not logged in';

  if (err instanceof ApiErrors.ForbiddenError)
    return 'You do not have permissions to do this';

  return 'Unexpected response from the server';
};

export const reducer: ApplicationReducer<HostHistoryState> = ReducerBuilder
  .withInitialState<HostHistoryState>({
    fetching: false,
    error: null,
    matches: [],
    host: null,
    hasMorePages: true,
  })
  .handle(LoadHostHistory.clear, () => ({
    fetching: false,
    error: null,
    matches: [],
    host: null,
    hasMorePages: false,
  }))
  .handle(LoadHostHistory.started, (prev, action) => ({
    fetching: true,
    error: null,
    host: action.payload!.parameters.host,
    matches: prev.matches,
    hasMorePages: prev.hasMorePages,
  }))
  .handle(LoadHostHistory.success, (prev, action) => ({
    fetching: false,
    error: null,
    matches: concat(prev.matches, action.payload!.result),
    host: prev.host,
    hasMorePages: action.payload!.result.length > 0,
  }))
  .handle(LoadHostHistory.failure, (prev, action) => ({
    fetching: false,
    error: displayError(action.payload!.error),
    matches: prev.matches,
    host: prev.host,
    hasMorePages: prev.hasMorePages,
  }))
  .handle(RemoveMatch.started, (prev, action) => ({
    ...prev,
    matches: prev.matches.map((match) => {
      if (match.id !== action.payload!.parameters.id)
        return match;

      return {
        ...match,
        removed: true,
        removedBy: action.payload!.result.username,
        remvoedReason: action.payload!.parameters.reason,
      };
    }),
  }))
  .handle(RemoveMatch.failure, (prev, action) => ({
    ...prev,
    matches: prev.matches.map((match) => {
      if (match.id !== action.payload!.parameters.id)
        return match;

      return {
        ...match,
        removed: false,
        removedBy: null,
        remvoedReason: null,
      };
    }),
  }))
  .handle(ApproveMatch.started, (prev, action) => ({
    ...prev,
    matches: prev.matches.map((match) => {
      if (match.id !== action.payload!.parameters.id)
        return match;

      return {
        ...match,
        approvedBy: action.payload!.result.username,
      };
    }),
  }))
  .handle(ApproveMatch.failure, (prev, action) => ({
    ...prev,
    matches: prev.matches.map((match) => {
      if (match.id !== action.payload!.parameters.id)
        return match;

      return {
        ...match,
        approvedBy: null,
      };
    }),
  }))
  .build();
