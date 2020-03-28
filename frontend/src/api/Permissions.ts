import moment from 'moment-timezone';

import { authHeaders, callApi, fetchArray, fetchObject } from './util';
import { PermissionModerationLogEntry } from '../models/PermissionModerationLogEntry';
import { UserCountPerPermission, UsersInPermission } from '../models/Permissions';

export const fetchUserCountPerPermission = (): Promise<UserCountPerPermission> =>
  fetchObject<UserCountPerPermission>({
    url: `/api/permissions`,
  });

export const fetchUsersInPermission = (permission: string): Promise<UsersInPermission> =>
  fetchObject<UsersInPermission>({
    url: `/api/permissions/${permission}`,
  });

export const fetchUsersInPermissionWithLetter = (permission: string, letter: string): Promise<string[]> =>
  fetchArray<string>({
    url: `/api/permissions/${permission}/${letter}`,
  });

export const fetchPermissionModerationLog = (): Promise<PermissionModerationLogEntry[]> =>
  fetchArray<PermissionModerationLogEntry>({
    url: `/api/permissions/log`,
  }).then(responses => responses.map(response => ({ ...response, at: moment.utc(response.at) })));

export const callAddPermission = (permission: string, username: string, accessToken: string): Promise<void> =>
  callApi({
    url: `/api/permissions/${permission}/${username}`,
    config: {
      method: 'POST',
      headers: authHeaders(accessToken),
    },
    status: 201,
  });

export const callRemovePermission = (permission: string, username: string, accessToken: string): Promise<void> =>
  callApi({
    url: `/api/permissions/${permission}/${username}`,
    config: {
      method: 'DELETE',
      headers: authHeaders(accessToken),
    },
    status: 204,
  });
