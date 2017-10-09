import { createAction } from 'redux-actions';
import { Match } from '../models/Match';
import { HostingRules } from '../state/HostingRulesState';
import { PermissionModerationLogEntry } from '../models/PermissionModerationLogEntry';
import { PermissionsMap } from '../models/PermissionsMap';
import { CreateMatchData } from '../models/CreateMatchData';

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
  openDialog: createAction<number>('OPEN_REMOVE_MATCH_DIALOG'),
  closeDialog: createAction('CLOSE_REMOVE_MATCH_DIALOG'),
  start: createAction<RemoveMatchParameters>('REMOVE_MATCH_START'),
  started: createAction<WithParameters<RemoveMatchParameters> & WithResult<RemoveMatchOptimisticData>>(
    'REMOVE_MATCH_STARTED',
  ),
  success: createAction<WithParameters<RemoveMatchParameters>>('REMOVE_MATCH_SUCCESS'),
  failure: createAction<WithParameters<RemoveMatchParameters> & WithError>('REMOVE_MATCH_FAILURE'),
};

export type ApproveMatchParameters = {
  readonly id: number;
};
export type ApproveMatchOptimisticData = {
  readonly username: string;
};

export const ApproveMatch = {
  openDialog: createAction<number>('OPEN_APPROVE_MATCH_DIALOG'),
  closeDialog: createAction('CLOSE_APPROVE_MATCH_DIALOG'),
  start: createAction<ApproveMatchParameters>('APPROVE_MATCH_START'),
  started: createAction<WithParameters<ApproveMatchParameters> & WithResult<ApproveMatchOptimisticData>>(
    'APPROVE_MATCH_STARTED',
  ),
  success: createAction<WithParameters<ApproveMatchParameters>>('APPROVE_MATCH_SUCCESS'),
  failure: createAction<WithParameters<ApproveMatchParameters> & WithError>('APPROVE_MATCH_FAILURE'),
};

export const UpdateUpcoming = {
  start: createAction('UPDATE_UPCOMING_START'),
  started: createAction('UPDATE_UPCOMING_STARTED'),
  success: createAction<WithResult<Match[]>>('UPDATE_UPCOMING_SUCCESS'),
  failure: createAction<WithError>('UPDATE_UPCOMING_FAILURE'),
};

export type LoadHostHistoryParameters = {
  readonly host: string;
  readonly refresh: boolean;
};

export const LoadHostHistory = {
  start: createAction<LoadHostHistoryParameters>('LOAD_HOST_HISTORY_START'),
  started: createAction<WithParameters<LoadHostHistoryParameters>>('LOAD_HOST_HISTORY_STARTED'),
  success: createAction<WithParameters<LoadHostHistoryParameters> & WithResult<Match[]>>(
    'LOAD_HOST_HISTORY_SUCCESS',
  ),
  failure: createAction<WithParameters<LoadHostHistoryParameters> & WithError>('LOAD_HOST_HISTORY_FAILURE'),
  clear: createAction('CLEAR_HOST_HISTORY'),
};

export type FetchMatchDetailsParameters = {
  readonly id: number;
};

export const FetchMatchDetails = {
  start: createAction<FetchMatchDetailsParameters>('FETCH_MATCH_DETAILS_START'),
  started: createAction<WithParameters<FetchMatchDetailsParameters>>('FETCH_MATCH_DETAILS_STARTED'),
  success: createAction<WithParameters<FetchMatchDetailsParameters> & WithResult<Match | null>>(
    'FETCH_MATCH_DETAILS_SUCCESS',
  ),
  failure: createAction<WithParameters<FetchMatchDetailsParameters> & WithError>('FETCH_MATCH_DETAILS_FAILURE'),
  clear: createAction('CLEAR_MATCH_DETAILS'),
};

export type LoginPayload = {
  readonly accessToken: string;
  readonly refreshToken: string;
};

export const Authentication = {
  login: createAction<LoginPayload>('LOGIN'),
  logout: createAction('LOGOUT'),
  attemptRefresh: createAction('ATTEMPT_AUTH_TOKEN_REFRESH'),
};

export type HostFormConflictsParameters = {
  readonly data: CreateMatchData;
};

export const HostFormConflicts = {
  start: createAction<HostFormConflictsParameters>('HOST_FORM_CONFLICTS_START'),
  started: createAction<WithParameters<HostFormConflictsParameters>>('HOST_FORM_CONFLICTS_STARTED'),
  success: createAction<WithParameters<HostFormConflictsParameters> & WithResult<Match[]>>(
    'HOST_FORM_CONFLICTS_SUCCESS',
  ),
  failure: createAction<WithParameters<HostFormConflictsParameters> & WithError>('HOST_FORM_CONFLICTS_FAILURE'),
};

export const GetHostingRules = {
  start: createAction('GET_HOSTING_RULES_START'),
  started: createAction('GET_HOSTING_RULES_STARTED'),
  success: createAction<WithResult<HostingRules>>('GET_HOSTING_RULES_SUCCESS'),
  failure: createAction<WithError>('GET_HOSTING_RULES_FAILURE'),
};

export const SetHostingRules = {
  start: createAction<string>('SET_HOSTING_RULES_START'),
  started: createAction<WithParameters<string> & WithResult<HostingRules>>('SET_HOSTING_RULES_STARTED'),
  success: createAction<WithParameters<string> & WithResult<HostingRules>>('SET_HOSTING_RULES_SUCCESS'),
  failure: createAction<WithParameters<string> & WithError>('SET_HOSTING_RULES_FAILURE'),
  openEditor: createAction('OPEN_HOSTING_RULES_EDITOR'),
  closeEditor: createAction('CLOSE_HOSTING_RULES_EDITOR'),
};

export const SyncTime = {
  start: createAction('TIME_SYNC_START'),
  started: createAction('TIME_SYNC_STARTED'),
  success: createAction<WithResult<number>>('TIME_SYNC_SUCCESS'),
  failure: createAction<WithError>('TIME_SYNC_FAILURE'),
};

export const Settings = {
  setDarkMode: createAction<boolean>('SET_DARK_MODE'),
  toggleDarkMode: createAction('TOGGLE_DARK_MODE'),
  setIs12h: createAction<boolean>('SET_IS_12_H_FORMAT'),
  toggleIs12h: createAction('TOGGLE_IS_12_H_FORMAT'),
  setTimezone: createAction<string>('SET_TIMEZONE'),
  setHideRemoved: createAction<boolean>('SET_HIDE_REMOVED'),
  toggleHideRemoved: createAction('TOGGLE_HIDE_REMOVED'),
  setShowOwnRemoved: createAction<boolean>('SET_SHOW_OWN_REMOVED'),
  toggleShowOwnRemoved: createAction('TOGGLE_SHOW_OWN_REMOVED'),
};

export const RefreshPermissionModerationLog = {
  start: createAction('REFRESH_PERMISSION_MODERATION_LOG_START'),
  started: createAction('REFRESH_PERMISSION_MODERATION_LOG_STARTED'),
  success: createAction<WithResult<PermissionModerationLogEntry[]>>('REFRESH_PERMISSION_MODERATION_LOG_SUCCESS'),
  failure: createAction<WithError>('REFRESH_PERMISSION_MODERATION_LOG_FAILURE'),
};

export const RefreshPermissions = {
  start: createAction('REFRESH_PERMISSIONS_START'),
  started: createAction('REFRESH_PERMISSIONS_STARTED'),
  success: createAction<WithResult<PermissionsMap>>('REFRESH_PERMISSIONS_SUCCESS'),
  failure: createAction<WithError>('REFRESH_PERMISSIONS_FAILURE'),
};

export const ExpandedPermissionNodes = {
  open: createAction<string>('OPEN_PERMISSION_NODE'),
  close: createAction<string>('CLOSE_PERMISSION_NODE'),
  toggle: createAction<string>('TOGGLE_PERMISSION_NODE'),
};

export type PermissionParameters = {
  readonly permission: string;
  readonly username: string;
};

export const AddPermission = {
  openDialog: createAction<string>('OPEN_ADD_PERMISSION_DIALOG'),
  closeDialog: createAction('CLOSE_ADD_PERMISSION_DIALOG'),
  start: createAction<string>('ADD_PERMISSION_START'),
  started: createAction<WithParameters<PermissionParameters>>('ADD_PERMISSION_STARTED'),
  success: createAction<WithParameters<PermissionParameters>>('ADD_PERMISSION_SUCCESS'),
  failure: createAction<WithParameters<PermissionParameters> & WithError>('ADD_PERMISSION_FAILURE'),
};

export const RemovePermission = {
  openDialog: createAction<PermissionParameters>('OPEN_REMOVE_PERMISSION_DIALOG'),
  closeDialog: createAction('CLOSE_REMOVE_PERMISSION_DIALOG'),
  start: createAction('REMOVE_PERMISSION_START'),
  started: createAction<WithParameters<PermissionParameters>>('REMOVE_PERMISSION_STARTED'),
  success: createAction<WithParameters<PermissionParameters>>('REMOVE_PERMISSION_SUCCESS'),
  failure: createAction<WithParameters<PermissionParameters> & WithError>('REMOVE_PERMISSION_FAILURE'),
};

export const FetchApiKey = {
  start: createAction('FETCH_API_KEY_START'),
  started: createAction('FETCH_API_KEY_STARTED'),
  success: createAction<WithResult<string | null>>('FETCH_API_KEY_SUCCESS'),
  failure: createAction<WithError>('FETCH_API_KEY_FAILURE'),
};

export const RegenerateApiKey = {
  start: createAction('REGENERATE_API_KEY_START'),
  started: createAction('REGENERATE_API_KEY_STARTED'),
  success: createAction<WithResult<string>>('REGENERATE_API_KEY_SUCCESS'),
  failure: createAction<WithError>('REGENERATE_API_KEY_FAILURE'),
};
