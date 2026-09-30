import { CheckIcon, WarningIcon } from '@phosphor-icons/react';
import { infiniteQueryOptions, queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import { HTTPError } from 'ky';
import { createElement } from 'react';
import * as v from 'valibot';

import { apiClient } from '../apiClient';
import { usernameAtom } from '../atoms/authentication';
import dayjs, { type Dayjs } from '../dayjs';
import type { CreateMatchData } from '../models/CreateMatchData';
import type { Match } from '../models/Match';
import { showToast } from '../services/AppToaster';

const singleMatchSchema = v.object({
  id: v.number(),
  author: v.string(),
  opens: v.pipe(
    v.string(),
    v.transform(value => dayjs.utc(value)),
  ),
  address: v.nullable(v.string()),
  ip: v.nullable(v.string()),
  scenarios: v.array(v.string()),
  tags: v.array(v.string()),
  teams: v.string(),
  size: v.nullable(v.number()),
  customStyle: v.nullable(v.string()),
  count: v.number(),
  content: v.string(),
  region: v.string(),
  removed: v.boolean(),
  removedAt: v.nullable(
    v.pipe(
      v.string(),
      v.transform(value => dayjs.utc(value)),
    ),
  ),
  removedBy: v.nullable(v.string()),
  removedReason: v.nullable(v.string()),
  created: v.pipe(
    v.string(),
    v.transform(value => dayjs.utc(value)),
  ),
  location: v.string(),
  version: v.string(),
  slots: v.number(),
  length: v.number(),
  mapSize: v.number(),
  pvpEnabledAt: v.number(),
  approvedBy: v.nullable(v.string()),
  hostingName: v.nullable(v.string()),
  tournament: v.boolean(),
  roles: v.array(v.string()),
});

export const MatchesData = {
  upcoming: queryOptions({
    queryKey: ['matches', 'upcoming'],
    queryFn: async ({ signal }) => apiClient.get('/api/matches/upcoming', { signal }).json(v.array(singleMatchSchema)),
    refetchInterval: 60 * 1000,
  }),
  hostHistory: (username: string) =>
    infiniteQueryOptions({
      queryKey: ['matches', 'hostHistory', username],
      queryFn: async ({ signal, pageParam }) =>
        apiClient
          .get(`/api/hosts/${username}/matches`, {
            searchParams: { before: pageParam },
            signal,
          })
          .json(v.array(singleMatchSchema)),
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
      queryFn: async ({ signal }) => apiClient.get<Match>(`/api/matches/${id}`, { signal }).json(singleMatchSchema),
    }),
  getPotentialConflicts: (region: string, time: Dayjs, version: string) =>
    queryOptions({
      gcTime: 0,
      queryKey: ['potentialConflicts', { region, time, version }],
      queryFn: async ({ signal }) =>
        apiClient
          .get('/api/matches/conflicts', {
            searchParams: {
              region,
              opens: time.toISOString(),
              version,
            },
            signal,
          })
          .json(v.array(singleMatchSchema)),
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
          apiClient.delete(`/api/matches/${id}`, {
            body: JSON.stringify({ reason }),
            headers: { 'Content-Type': 'application/json' },
            signal: null,
          }),
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
          showToast({
            color: 'green',
            icon: createElement(CheckIcon),
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
          showToast({
            color: 'red',
            icon: createElement(WarningIcon),
            message: `Failed to approve match #${id}`,
          });
        },
      });
    },
  },
};
