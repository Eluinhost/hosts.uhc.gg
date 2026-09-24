import { Intent } from '@blueprintjs/core';
import { TickIcon, WarningSignIcon } from '@blueprintjs/icons';
import { infiniteQueryOptions, queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import { HTTPError } from 'ky';
import { createElement } from 'react';
import { enforce } from 'vest';

import { apiClient } from '../apiClient';
import { usernameAtom } from '../atoms/authentication';
import dayjs, { type Dayjs } from '../dayjs';
import type { CreateMatchData } from '../models/CreateMatchData';
import type { Match } from '../models/Match';
import { showToast } from '../services/AppToaster';

const singleMatchSchema = enforce.shape({
  id: enforce.isNumber(),
  author: enforce.isString(),
  opens: enforce.isString(),
  address: enforce.anyOf(enforce.isNull(), enforce.isString()),
  ip: enforce.anyOf(enforce.isNull(), enforce.isString()),
  scenarios: enforce.isArrayOf(enforce.isString()),
  tags: enforce.isArrayOf(enforce.isString()),
  teams: enforce.isString(),
  size: enforce.anyOf(enforce.isNull(), enforce.isNumber()),
  customStyle: enforce.anyOf(enforce.isNull(), enforce.isString()),
  count: enforce.isNumber(),
  content: enforce.isString(),
  region: enforce.isString(),
  removed: enforce.isBoolean(),
  removedAt: enforce.anyOf(enforce.isNull(), enforce.isString()),
  removedBy: enforce.anyOf(enforce.isNull(), enforce.isString()),
  removedReason: enforce.anyOf(enforce.isNull(), enforce.isString()),
  created: enforce.isString(),
  location: enforce.isString(),
  version: enforce.isString(),
  slots: enforce.isNumber(),
  length: enforce.isNumber(),
  mapSize: enforce.isNumber(),
  pvpEnabledAt: enforce.isNumber(),
  approvedBy: enforce.anyOf(enforce.isNull(), enforce.isString()),
  hostingName: enforce.anyOf(enforce.isNull(), enforce.isString()),
  tournament: enforce.isBoolean(),
  roles: enforce.isArrayOf(enforce.isString()),
});

const transformMatch = (match: ReturnType<(typeof singleMatchSchema)['parse']>): Match => ({
  ...match,
  opens: dayjs.utc(match.opens),
  created: dayjs.utc(match.created),
  removedAt: match.removedAt ? dayjs.utc(match.removedAt) : null,
});

export const MatchesData = {
  upcoming: queryOptions({
    queryKey: ['matches', 'upcoming'],
    queryFn: async ({ signal }) => {
      const data = await apiClient.get('/api/matches/upcoming', { signal }).json(enforce.isArrayOf(singleMatchSchema));

      return data.map(transformMatch);
    },
    refetchInterval: 60 * 1000,
  }),
  hostHistory: (username: string) =>
    infiniteQueryOptions({
      queryKey: ['matches', 'hostHistory', username],
      queryFn: async ({ signal, pageParam }) => {
        const data = await apiClient
          .get(`/api/hosts/${username}/matches`, {
            searchParams: { before: pageParam },
            signal,
          })
          .json(enforce.isArrayOf(singleMatchSchema));

        return data.map(transformMatch);
      },
      initialPageParam: undefined as number | undefined,
      getNextPageParam: lastPage => {
        // using default page size of 20, so if less than 20 items in the page we're at the end
        if (lastPage.length < 20) {
          return undefined;
        }

        return lastPage[lastPage.length - 1].id;
      },
    }),
  getById: (id: number) =>
    queryOptions({
      queryKey: ['matches', 'byId', id],
      retry: (failureCount, error) => {
        if (error instanceof HTTPError && error.response.status === 404) {
          return false;
        }

        // matches default 'try 3 times'
        return failureCount < 2;
      },
      queryFn: async ({ signal }) => {
        const data = await apiClient.get<Match>(`/api/matches/${id}`, { signal }).json(singleMatchSchema);

        return transformMatch(data);
      },
    }),
  getPotentialConflicts: (region: string, time: Dayjs, version: string) =>
    queryOptions({
      queryKey: ['potentialConflicts', { region, time, version }],
      queryFn: async ({ signal }) => {
        const result = await apiClient
          .get('/api/matches/conflicts', {
            searchParams: {
              region,
              opens: time.toISOString(),
              version,
            },
            signal,
          })
          .json(enforce.isArrayOf(singleMatchSchema));

        return result.map(transformMatch);
      },
    }),
  mutations: {
    useCreateMatch: () => {
      const client = useQueryClient();
      const username = useAtomValue(usernameAtom);

      return useMutation({
        mutationFn: (data: CreateMatchData) =>
          apiClient.post('/api/matches', {
            body: JSON.stringify({
              ...data,
              opens: data.opens.utc(),
              // convert the modifiers into scenarios
              scenarios: [...data.modifiers, ...data.scenarios],
            }),
            headers: { 'Content-Type': 'application/json' },
            signal: null,
          }),
        onSuccess: () => {
          void client.invalidateQueries(MatchesData.upcoming);
          if (username) {
            void client.invalidateQueries(MatchesData.hostHistory(username));
          }
        },
      });
    },
    useRemoveMatch: () => {
      const client = useQueryClient();

      return useMutation({
        mutationFn: ({ id, reason }: { id: number; reason: string }) =>
          apiClient.delete(`/api/matches/${id}`, { body: JSON.stringify({ reason }), signal: null }),
        onSuccess: (_data, { id }) => {
          // invalidate upcoming matches only if it's in there
          if (client.getQueryData(MatchesData.upcoming.queryKey)?.some(x => x.id === id)) {
            void client.invalidateQueries(MatchesData.upcoming);
          }

          // just invalidate whole host history, we don't know the host name here
          void client.invalidateQueries({
            queryKey: MatchesData.hostHistory('').queryKey.slice(2),
          });

          void client.invalidateQueries(MatchesData.getById(id));
        },
      });
    },
    useApproveMatch: () => {
      const client = useQueryClient();

      return useMutation({
        mutationFn: async (id: number) => apiClient.post(`/api/matches/${id}/approve`, { signal: null }),
        onSuccess: (_data, id) => {
          void showToast({
            intent: Intent.SUCCESS,
            icon: createElement(TickIcon),
            message: `Approved match #${id}`,
          });

          // invalidate upcoming matches only if it's in there
          if (client.getQueryData(MatchesData.upcoming.queryKey)?.some(x => x.id === id)) {
            void client.invalidateQueries(MatchesData.upcoming);
          }

          // just invalidate whole host history, we don't know the host name here
          void client.invalidateQueries({
            queryKey: MatchesData.hostHistory('').queryKey.slice(2),
          });

          void client.invalidateQueries(MatchesData.getById(id));
        },
        onError: (_error, id) => {
          void showToast({
            intent: Intent.DANGER,
            icon: createElement(WarningSignIcon),
            message: `Failed to approve match #${id}`,
          });
        },
      });
    },
  },
};
