import { Intent } from '@blueprintjs/core';
import { WarningIcon } from '@phosphor-icons/react';
import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { createElement } from 'react';
import { enforce } from 'vest';

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
      apiClient.get(`/api/permissions`, { signal }).json(enforce.record(enforce.isNumber())),
  }),
  fetchUsersInPermission: (permission: string) =>
    queryOptions({
      queryKey: [BASE_KEY, 'permissions', permission, 'users'],
      queryFn: async ({ signal }): Promise<UsersInPermission> =>
        apiClient.get(`/api/permissions/${permission}`, { signal }).json(
          enforce.anyOf(
            // count per letter
            enforce.record(enforce.isNumber()),
            // usernames
            enforce.isArrayOf(enforce.isString()),
          ),
        ),
    }),
  fetchUsersInPermissionLetter: (permission: string, letter: string) =>
    queryOptions({
      queryKey: [BASE_KEY, 'permissions', permission, 'letter', letter, 'users'],
      queryFn: async ({ signal }): Promise<Array<string>> =>
        apiClient
          .get(`/api/permissions/${permission}/${letter}`, { signal })
          .json(enforce.isArrayOf(enforce.isString())),
    }),
  fetchPermissionModerationLog: queryOptions({
    queryKey: [BASE_KEY, 'moderationLog'],
    queryFn: async ({ signal }): Promise<Array<PermissionModerationLogEntry>> => {
      const response = await apiClient.get(`/api/permissions/log`, { signal }).json(
        enforce.isArrayOf(
          enforce.shape({
            id: enforce.isNumber(),
            modifier: enforce.isString(),
            username: enforce.isString(),
            at: enforce.isString(),
            permission: enforce.isString(),
            added: enforce.isBoolean(),
          }),
        ),
      );

      return response.map(x => ({ ...x, at: dayjs.utc(x.at) }));
    },
  }),
  mutations: {
    useAddPermission: () => {
      const invalidate = useInvalidateAfterModification();

      return useMutation({
        mutationFn: ({ permission, username }: { permission: string; username: string }) =>
          apiClient.post(`/api/permissions/${permission}/${username}`, { signal: null }),
        onSuccess: async (_response, { permission, username }) => {
          invalidate(permission, username);

          await showToast({
            intent: Intent.SUCCESS,
            message: `Added permission '${permission}' to /u/${username}`,
          });
        },
        onError: async (_error, variables) => {
          await showToast({
            intent: Intent.DANGER,
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
        onSuccess: async (_, { permission, username }) => {
          invalidate(permission, username);

          await showToast({
            intent: Intent.SUCCESS,
            message: `Removed permission '${permission}' from /u/${username}`,
          });
        },
        onError: async (_error, { username, permission }) => {
          await showToast({
            intent: Intent.DANGER,
            icon: createElement(WarningIcon),
            message: `Failed to remove permission '${permission}' from /u/${username}`,
          });
        },
      });
    },
  },
};
