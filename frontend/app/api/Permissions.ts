import { PermissionsMap } from '../models/PermissionsMap';
import { authHeaders, callApi, fetchArray, fetchObject } from './util';
import { PermissionModerationLogEntry } from '../models/PermissionModerationLogEntry';
import { always } from 'ramda';

export const fetchPermissions = (): Promise<PermissionsMap> => fetchObject<PermissionsMap>({
  url: `/api/permissions`,
});

export const fetchPermissionModerationLog = (): Promise<PermissionModerationLogEntry[]> =>
  fetchArray<PermissionModerationLogEntry>({
    url: `/api/permissions/log`,
    momentProps: ['at'],
  });

export const callAddPermission = (permission: string, username: string, accessToken: string): Promise<void> =>
  callApi({
    url: `/api/permissions/${username}/${permission}`,
    config: {
      method: 'POST',
      headers: authHeaders(accessToken),
    },
    status: 201,
  });

export const callRemovePermission = (permission: string, username: string, accessToken: string): Promise<void> =>
  callApi({
    url: `/api/permissions/${username}/${permission}`,
    config: {
      method: 'DELETE',
      headers: authHeaders(accessToken),
    },
    status: 204,
  });
