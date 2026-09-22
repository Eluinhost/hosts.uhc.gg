import { createAction } from 'typesafe-redux-helpers';

import type { CreateMatchData } from '../models/CreateMatchData';
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

export type FetchMatchDetailsParameters = {
  readonly id: number;
};

export const FetchMatchDetails = {
  start: createAction('FETCH_MATCH_DETAILS_START', (payload: FetchMatchDetailsParameters) => payload),
  started: createAction(
    'FETCH_MATCH_DETAILS_STARTED',
    (payload: WithParameters<FetchMatchDetailsParameters>) => payload,
  ),
  success: createAction(
    'FETCH_MATCH_DETAILS_SUCCESS',
    (payload: WithParameters<FetchMatchDetailsParameters> & WithResult<Match | null>) => payload,
  ),
  failure: createAction(
    'FETCH_MATCH_DETAILS_FAILURE',
    (payload: WithParameters<FetchMatchDetailsParameters> & WithError) => payload,
  ),
  clear: createAction('CLEAR_MATCH_DETAILS'),
};

export const SyncTime = {
  start: createAction('TIME_SYNC_START'),
  started: createAction('TIME_SYNC_STARTED'),
  success: createAction('TIME_SYNC_SUCCESS', (payload: WithResult<number>) => payload),
  failure: createAction('TIME_SYNC_FAILURE', (payload: WithError) => payload),
};

export const Presets = {
  save: createAction('SAVE_PRESETS', (payload: Record<string, string>) => payload),
};

export const FetchApiKey = {
  start: createAction('FETCH_API_KEY_START'),
  started: createAction('FETCH_API_KEY_STARTED'),
  success: createAction('FETCH_API_KEY_SUCCESS', (payload: WithResult<string | null>) => payload),
  failure: createAction('FETCH_API_KEY_FAILURE', (payload: WithError) => payload),
};

export const RegenerateApiKey = {
  start: createAction('REGENERATE_API_KEY_START'),
  started: createAction('REGENERATE_API_KEY_STARTED'),
  success: createAction('REGENERATE_API_KEY_SUCCESS', (payload: WithResult<string>) => payload),
  failure: createAction('REGENERATE_API_KEY_FAILURE', (payload: WithError) => payload),
};

export const ClearStorage = {
  start: createAction('CLEAR_STORAGE_START'),
  started: createAction('CLEAR_STORAGE_STARTED'),
  success: createAction('CLEAR_STORAGE_SUCCESS'),
  failure: createAction('CLEAR_STORAGE_FAILURE', (payload: WithError) => payload),
};

export const SetSavedHostFormData = {
  start: createAction('SET_SAVED_HOST_FORM_DATA_START', (payload: CreateMatchData) => payload),
  started: createAction('SET_SAVED_HOST_FORM_DATA_STARTED', (payload: WithParameters<CreateMatchData>) => payload),
  success: createAction('SET_SAVED_HOST_FORM_DATA_SUCCESS', (payload: WithParameters<CreateMatchData>) => payload),
  failure: createAction(
    'SET_SAVED_HOST_FORM_DATA_FAILURE',
    (payload: WithParameters<CreateMatchData> & WithError) => payload,
  ),
};
