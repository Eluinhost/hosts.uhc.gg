import { ApiErrors } from '../api';
import { ApplicationReducer, ReducerBuilder } from './ReducerBuilder';
import * as moment from 'moment-timezone';
import { GetHostingRules, SetHostingRules } from '../actions';

export type HostingRules = {
  readonly content: string;
  readonly modified: moment.Moment;
  readonly author: string;
};

export type HostingRulesState = {
  readonly fetching: boolean;
  readonly error: string | null;
  readonly data: HostingRules | null;
  readonly backupData: HostingRules | null;
  readonly editing: boolean;
};

const displayError = (err: Error): string => {
  if (err instanceof ApiErrors.BadDataError) {
    return err.message;
  }

  if (err instanceof ApiErrors.NotAuthenticatedError) {
    return 'You are not logged in';
  }

  if (err instanceof ApiErrors.ForbiddenError) {
    return 'You do not have permissions to do this';
  }

  return 'Unexpected response from the server';
};

export const reducer: ApplicationReducer<HostingRulesState> = ReducerBuilder.withInitialState<HostingRulesState>({
  fetching: false,
  error: null,
  data: null,
  backupData: null,
  editing: false,
})
  .handle(GetHostingRules.started, (prev, action) => ({
    ...prev,
    fetching: true,
    error: null,
  }))
  .handle(GetHostingRules.success, (prev, action) => ({
    ...prev,
    fetching: false,
    error: null,
    data: action.payload!.result,
  }))
  .handle(GetHostingRules.failure, (prev, action) => ({
    ...prev,
    fetching: false,
    error: displayError(action.payload!.error),
  }))
  .handle(SetHostingRules.started, (prev, action) => ({
    ...prev,
    fetching: true,
    error: null,
    data: action.payload!.result,
    backupData: prev.data,
  }))
  .handle(SetHostingRules.success, (prev, action) => ({
    ...prev,
    fetching: false,
    error: null,
    backupData: null,
  }))
  .handle(SetHostingRules.failure, (prev, action) => ({
    ...prev,
    fetching: false,
    error: displayError(action.payload!.error),
    data: prev.backupData,
    backupData: null,
  }))
  .handle(SetHostingRules.openEditor, (prev, action) => ({
    ...prev,
    editing: true,
  }))
  .handle(SetHostingRules.closeEditor, (prev, action) => ({
    ...prev,
    editing: false,
  }))
  .build();
