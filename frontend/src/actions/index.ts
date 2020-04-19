import { createAction } from 'typesafe-redux-helpers';
import { Match } from '../models/Match';
import { HostingRules } from '../state/HostingRulesState';
import { PermissionModerationLogEntry } from '../models/PermissionModerationLogEntry';
import { CreateMatchData } from '../models/CreateMatchData';
import { UserCountPerPermission, UsersInPermission } from '../models/Permissions';

export type WithResult<Result> = {
  readonly result: Result;
};
export type WithParameters<Parameters> = {
  readonly parameters: Parameters;
};
export type WithError = {
  readonly error: Error;
};

export type RemoveMatchParameters = {
  readonly id: number;
  readonly reason: string;
};
export type RemoveMatchOptimisticData = {
  readonly username: string;
};

export const RemoveMatch = {
  formId: 'remove-match-form',
  openDialog: createAction('OPEN_REMOVE_MATCH_DIALOG', (id: number) => id),
  closeDialog: createAction('CLOSE_REMOVE_MATCH_DIALOG'),
  start: createAction('REMOVE_MATCH_START', (payload: RemoveMatchParameters) => payload),
  started: createAction(
    'REMOVE_MATCH_STARTED',
    (payload: WithParameters<RemoveMatchParameters> & WithResult<RemoveMatchOptimisticData>) => payload,
  ),
  success: createAction('REMOVE_MATCH_SUCCESS', (payload: WithParameters<RemoveMatchParameters>) => payload),
  failure: createAction(
    'REMOVE_MATCH_FAILURE',
    (payload: WithParameters<RemoveMatchParameters> & WithError) => payload,
  ),
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

export type LoginPayload = {
  readonly accessToken: string;
  readonly refreshToken: string;
};

export const Authentication = {
  login: createAction('LOGIN', (payload: LoginPayload) => payload),
  logout: createAction('LOGOUT'),
  attemptRefresh: createAction('ATTEMPT_AUTH_TOKEN_REFRESH'),
};

export type HostFormConflictsParameters = {
  readonly data: CreateMatchData;
};

export const HostFormConflicts = {
  start: createAction('HOST_FORM_CONFLICTS_START', (payload: HostFormConflictsParameters) => payload),
  started: createAction(
    'HOST_FORM_CONFLICTS_STARTED',
    (payload: WithParameters<HostFormConflictsParameters>) => payload,
  ),
  success: createAction(
    'HOST_FORM_CONFLICTS_SUCCESS',
    (payload: WithParameters<HostFormConflictsParameters> & WithResult<Match[]>) => payload,
  ),
  failure: createAction(
    'HOST_FORM_CONFLICTS_FAILURE',
    (payload: WithParameters<HostFormConflictsParameters> & WithError) => payload,
  ),
};

export const GetHostingRules = {
  start: createAction('GET_HOSTING_RULES_START'),
  started: createAction('GET_HOSTING_RULES_STARTED'),
  success: createAction('GET_HOSTING_RULES_SUCCESS', (payload: WithResult<HostingRules>) => payload),
  failure: createAction('GET_HOSTING_RULES_FAILURE', (payload: WithError) => payload),
};

export const SetHostingRules = {
  start: createAction('SET_HOSTING_RULES_START', (payload: string) => payload),
  started: createAction(
    'SET_HOSTING_RULES_STARTED',
    (payload: WithParameters<string> & WithResult<HostingRules>) => payload,
  ),
  success: createAction(
    'SET_HOSTING_RULES_SUCCESS',
    (payload: WithParameters<string> & WithResult<HostingRules>) => payload,
  ),
  failure: createAction('SET_HOSTING_RULES_FAILURE', (payload: WithParameters<string> & WithError) => payload),
  openEditor: createAction('OPEN_HOSTING_RULES_EDITOR'),
  closeEditor: createAction('CLOSE_HOSTING_RULES_EDITOR'),
};

export const SyncTime = {
  start: createAction('TIME_SYNC_START'),
  started: createAction('TIME_SYNC_STARTED'),
  success: createAction('TIME_SYNC_SUCCESS', (payload: WithResult<number>) => payload),
  failure: createAction('TIME_SYNC_FAILURE', (payload: WithError) => payload),
};

export const Settings = {
  setDarkMode: createAction('SET_DARK_MODE', (payload: boolean) => payload),
  toggleDarkMode: createAction('TOGGLE_DARK_MODE'),
  setIs12h: createAction('SET_IS_12_H_FORMAT', (payload: boolean) => payload),
  toggleIs12h: createAction('TOGGLE_IS_12_H_FORMAT'),
  setTimezone: createAction('SET_TIMEZONE', (payload: string) => payload),
  setHideRemoved: createAction('SET_HIDE_REMOVED', (payload: boolean) => payload),
  toggleHideRemoved: createAction('TOGGLE_HIDE_REMOVED'),
  setShowOwnRemoved: createAction('SET_SHOW_OWN_REMOVED', (payload: boolean) => payload),
  toggleShowOwnRemoved: createAction('TOGGLE_SHOW_OWN_REMOVED'),
};

export const RefreshPermissionModerationLog = {
  start: createAction('REFRESH_PERMISSION_MODERATION_LOG_START'),
  started: createAction('REFRESH_PERMISSION_MODERATION_LOG_STARTED'),
  success: createAction(
    'REFRESH_PERMISSION_MODERATION_LOG_SUCCESS',
    (payload: WithResult<PermissionModerationLogEntry[]>) => payload,
  ),
  failure: createAction('REFRESH_PERMISSION_MODERATION_LOG_FAILURE', (payload: WithError) => payload),
};

export const FetchUserCountPerPermission = {
  start: createAction('FETCH_USER_COUNT_PER_PERMISSION_START'),
  started: createAction('FETCH_USER_COUNT_PER_PERMISSION_STARTED'),
  success: createAction(
    'FETCH_USER_COUNT_PER_PERMISSION_SUCCESS',
    (payload: WithResult<UserCountPerPermission>) => payload,
  ),
  failure: createAction('FETCH_USER_COUNT_PER_PERMISSION_FAILURE', (payload: WithError) => payload),
};

export const PermissionNode = {
  open: createAction('OPEN_PERMISSION_NODE', (payload: string) => payload),
  close: createAction('CLOSE_PERMISSION_NODE', (payload: string) => payload),
};

export type ExpandPermissionLetterNodeParameters = {
  readonly permission: string;
  readonly letter: string;
};

export const PermissionLetterNode = {
  open: createAction('OPEN_PERMISSION_LETTER_NODE', (payload: ExpandPermissionLetterNodeParameters) => payload),
  close: createAction('CLOSE_PERMISSION_LETTER_NODE', (payload: ExpandPermissionLetterNodeParameters) => payload),
  toggle: createAction('TOGGLE_PERMISSION_LETTER_NODE', (payload: ExpandPermissionLetterNodeParameters) => payload),
};

export const FetchUsersInPermission = {
  start: createAction('FETCH_USERS_IN_PERMISSION_START', (payload: string) => payload),
  started: createAction('FETCH_USERS_IN_PERMISSION_STARTED', (payload: WithParameters<string>) => payload),
  success: createAction(
    'FETCH_USERS_IN_PERMISSION_SUCCESS',
    (payload: WithParameters<string> & WithResult<UsersInPermission>) => payload,
  ),
  failure: createAction('FETCH_USERS_IN_PERMISSION_FAILURE', (payload: WithParameters<string> & WithError) => payload),
};

export type FetchUsersInPermissionWithLetterParameters = {
  readonly permission: string;
  readonly letter: string;
};

export const FetchUsersInPermissionWithLetter = {
  start: createAction(
    'FETCH_USERS_IN_PERMISSION_WITH_LETTER_START',
    (payload: FetchUsersInPermissionWithLetterParameters) => payload,
  ),
  started: createAction(
    'FETCH_USERS_IN_PERMISSION_WITH_LETTER_STARTED',
    (payload: WithParameters<FetchUsersInPermissionWithLetterParameters>) => payload,
  ),
  success: createAction(
    'FETCH_USERS_IN_PERMISSION_WITH_LETTER_SUCCESS',
    (payload: WithParameters<FetchUsersInPermissionWithLetterParameters> & WithResult<string[]>) => payload,
  ),
  failure: createAction(
    'FETCH_USERS_IN_PERMISSION_WITH_LETTER_FAILURE',
    (payload: WithParameters<FetchUsersInPermissionWithLetterParameters> & WithError) => payload,
  ),
};

export type PermissionParameters = {
  readonly permission: string;
  readonly username: string;
};

export const AddPermission = {
  openDialog: createAction('OPEN_ADD_PERMISSION_DIALOG', (payload: string) => payload),
  closeDialog: createAction('CLOSE_ADD_PERMISSION_DIALOG'),
  start: createAction('ADD_PERMISSION_START', (payload: string) => payload),
  started: createAction('ADD_PERMISSION_STARTED', (payload: WithParameters<PermissionParameters>) => payload),
  success: createAction('ADD_PERMISSION_SUCCESS', (payload: WithParameters<PermissionParameters>) => payload),
  failure: createAction(
    'ADD_PERMISSION_FAILURE',
    (payload: WithParameters<PermissionParameters> & WithError) => payload,
  ),
};

export const RemovePermission = {
  openDialog: createAction('OPEN_REMOVE_PERMISSION_DIALOG', (payload: PermissionParameters) => payload),
  closeDialog: createAction('CLOSE_REMOVE_PERMISSION_DIALOG'),
  start: createAction('REMOVE_PERMISSION_START'),
  started: createAction('REMOVE_PERMISSION_STARTED', (payload: WithParameters<PermissionParameters>) => payload),
  success: createAction('REMOVE_PERMISSION_SUCCESS', (payload: WithParameters<PermissionParameters>) => payload),
  failure: createAction(
    'REMOVE_PERMISSION_FAILURE',
    (payload: WithParameters<PermissionParameters> & WithError) => payload,
  ),
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
  start: createAction('SET_SAVED_HOST_FORM_DATA_START', (payload: Partial<CreateMatchData>) => payload),
  started: createAction(
    'SET_SAVED_HOST_FORM_DATA_STARTED',
    (payload: WithParameters<Partial<CreateMatchData>>) => payload,
  ),
  success: createAction(
    'SET_SAVED_HOST_FORM_DATA_SUCCESS',
    (payload: WithParameters<Partial<CreateMatchData>>) => payload,
  ),
  failure: createAction(
    'SET_SAVED_HOST_FORM_DATA_FAILURE',
    (payload: WithParameters<Partial<CreateMatchData>> & WithError) => payload,
  ),
};
