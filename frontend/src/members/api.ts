import { WarningIcon } from '@phosphor-icons/react';
import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { createElement } from 'react';
import * as v from 'valibot';

import { apiClient } from '../apiClient';
import dayjs from '../dayjs';
import type { PermissionModerationLogEntry } from '../models/PermissionModerationLogEntry';
import type { UserCountPerPermission, UsersInPermission } from '../models/Permissions';
import { showToast } from '../services/AppToaster';

const BASE_KEY = 'members';

const useInvalidateAfterModification = () => {
  const client = useQueryClient();

  return (permission: string, username: string) => {
    void client.invalidateQueries({ queryKey: MembersData.fetchPermissionModerationLog.queryKey });
    void client.invalidateQueries({ queryKey: MembersData.fetchUserCountPerPermission.queryKey });
    void client.invalidateQueries({ queryKey: MembersData.fetchUsersInPermission(permission).queryKey });
    void client.invalidateQueries({
      queryKey: MembersData.fetchUsersInPermissionLetter(permission, username.substring(0, 1).toLowerCase()).queryKey,
    });
  };
};

export const MembersData = {
  fetchUserCountPerPermission: queryOptions({
    queryKey: [BASE_KEY, 'countPerPermission'],
    queryFn: async ({ signal }): Promise<UserCountPerPermission> =>
      apiClient.get(`/api/permissions`, { signal }).json(v.record(v.string(), v.number())),
  }),
  fetchUsersInPermission: (permission: string) =>
    queryOptions({
      queryKey: [BASE_KEY, 'permissions', permission, 'users'],
      queryFn: async ({ signal }): Promise<UsersInPermission> =>
        apiClient.get(`/api/permissions/${permission}`, { signal }).json(
          v.union([
            // count per letter
            v.record(v.string(), v.number()),
            // usernames
            v.array(v.string()),
          ]),
        ),
    }),
  fetchUsersInPermissionLetter: (permission: string, letter: string) =>
    queryOptions({
      queryKey: [BASE_KEY, 'permissions', permission, 'letter', letter, 'users'],
      queryFn: async ({ signal }): Promise<Array<string>> =>
        apiClient.get(`/api/permissions/${permission}/${letter}`, { signal }).json(v.array(v.string())),
    }),
  fetchPermissionModerationLog: queryOptions({
    queryKey: [BASE_KEY, 'moderationLog'],
    queryFn: async ({ signal }): Promise<Array<PermissionModerationLogEntry>> =>
      apiClient.get(`/api/permissions/log`, { signal }).json(
        v.array(
          v.object({
            id: v.number(),
            modifier: v.string(),
            username: v.string(),
            at: v.pipe(
              v.string(),
              v.transform(x => dayjs.utc(x)),
            ),
            permission: v.string(),
            added: v.boolean(),
          }),
        ),
      ),
  }),
  mutations: {
    useAddPermission: () => {
      const invalidate = useInvalidateAfterModification();

      return useMutation({
        mutationFn: ({ permission, username }: { permission: string; username: string }) =>
          apiClient.post(`/api/permissions/${permission}/${username}`, { signal: null }),
        onSuccess: (_response, { permission, username }) => {
          invalidate(permission, username);

          showToast({
            color: 'green',
            message: `Added permission '${permission}' to /u/${username}`,
          });
        },
        onError: (_error, variables) => {
          showToast({
            color: 'red',
            icon: createElement(WarningIcon),
            message: `Failed to add permission to /u/${variables.username}`,
          });
        },
      });
    },

    useRemovePermission: () => {
      const invalidate = useInvalidateAfterModification();

      return useMutation({
        mutationFn: ({ permission, username }: { permission: string; username: string }) =>
          apiClient.delete(`/api/permissions/${permission}/${username}`, { signal: null }),
        onSuccess: (_, { permission, username }) => {
          invalidate(permission, username);

          showToast({
            color: 'green',
            message: `Removed permission '${permission}' from /u/${username}`,
          });
        },
        onError: (_error, { username, permission }) => {
          showToast({
            color: 'red',
            icon: createElement(WarningIcon),
            message: `Failed to remove permission '${permission}' from /u/${username}`,
          });
        },
      });
    },
  },
};
