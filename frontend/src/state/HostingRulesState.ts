import { createReducer } from 'typesafe-redux-helpers';
import { Reducer } from 'redux';
import moment from 'moment-timezone';

import { ApiErrors } from '../api';
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

export const reducer: Reducer<HostingRulesState> = createReducer<HostingRulesState>({
  fetching: false,
  error: null,
  data: null,
  backupData: null,
  editing: false,
})
  .handleAction(GetHostingRules.started, state => ({
    ...state,
    fetching: true,
    error: null,
  }))
  .handleAction(GetHostingRules.success, (state, action) => ({
    ...state,
    fetching: false,
    error: null,
    data: action.payload.result,
  }))
  .handleAction(GetHostingRules.failure, (state, action) => ({
    ...state,
    fetching: false,
    error: displayError(action.payload.error),
  }))
  .handleAction(SetHostingRules.started, (state, action) => ({
    ...state,
    fetching: true,
    error: null,
    data: action.payload.result,
    backupData: state.data,
  }))
  .handleAction(SetHostingRules.success, state => ({
    ...state,
    fetching: false,
    error: null,
    backupData: null,
  }))
  .handleAction(SetHostingRules.failure, (state, action) => ({
    ...state,
    fetching: false,
    error: displayError(action.payload.error),
    data: state.backupData,
    backupData: null,
  }))
  .handleAction(SetHostingRules.openEditor, state => ({
    ...state,
    editing: true,
  }))
  .handleAction(SetHostingRules.closeEditor, state => ({
    ...state,
    editing: false,
  }));
