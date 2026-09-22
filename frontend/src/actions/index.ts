import { createAction } from 'typesafe-redux-helpers';

import type { Match } from '../models/Match';

export type WithResult<Result> = {
  readonly result: Result;
};
export type WithParameters<Parameters> = {
  readonly parameters: Parameters;
};
export type WithError = {
  readonly error: Error;
};

export type ApproveMatchParameters = {
  readonly id: number;
};
export type ApproveMatchOptimisticData = {
  readonly username: string;
};

export const ApproveMatch = {
  openDialog: createAction('OPEN_APPROVE_MATCH_DIALOG', (id: number) => id),
  closeDialog: createAction('CLOSE_APPROVE_MATCH_DIALOG'),
  start: createAction('APPROVE_MATCH_START', (payload: ApproveMatchParameters) => payload),
  started: createAction(
    'APPROVE_MATCH_STARTED',
    (payload: WithParameters<ApproveMatchParameters> & WithResult<ApproveMatchOptimisticData>) => payload,
  ),
  success: createAction('APPROVE_MATCH_SUCCESS', (payload: WithParameters<ApproveMatchParameters>) => payload),
  failure: createAction(
    'APPROVE_MATCH_FAILURE',
    (payload: WithParameters<ApproveMatchParameters> & WithError) => payload,
  ),
};

export const UpdateUpcoming = {
  start: createAction('UPDATE_UPCOMING_START'),
  started: createAction('UPDATE_UPCOMING_STARTED'),
  success: createAction('UPDATE_UPCOMING_SUCCESS', (payload: WithResult<Match[]>) => payload),
  failure: createAction('UPDATE_UPCOMING_FAILURE', (payload: WithError) => payload),
};

export type LoadHostHistoryParameters = {
  readonly host: string;
  readonly refresh: boolean;
};

export const LoadHostHistory = {
  start: createAction('LOAD_HOST_HISTORY_START', (payload: LoadHostHistoryParameters) => payload),
  started: createAction('LOAD_HOST_HISTORY_STARTED', (payload: WithParameters<LoadHostHistoryParameters>) => payload),
  success: createAction(
    'LOAD_HOST_HISTORY_SUCCESS',
    (payload: WithParameters<LoadHostHistoryParameters> & WithResult<Match[]>) => payload,
  ),
  failure: createAction(
    'LOAD_HOST_HISTORY_FAILURE',
    (payload: WithParameters<LoadHostHistoryParameters> & WithError) => payload,
  ),
  clear: createAction('CLEAR_HOST_HISTORY'),
};
