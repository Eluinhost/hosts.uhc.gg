import { createAction } from 'typesafe-redux-helpers';

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
