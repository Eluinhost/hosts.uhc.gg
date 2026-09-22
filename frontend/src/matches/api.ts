import { queryOptions } from '@tanstack/react-query';
import { HTTPError } from 'ky';
import { enforce } from 'vest';

import { apiClient } from '../apiClient';
import dayjs, { type Dayjs } from '../dayjs';
import type { Match } from '../models/Match';

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

export const MatchesData = {
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
      queryFn: async (): Promise<Match> => {
        const data = await apiClient.get<Match>(`/api/matches/${id}`).json(singleMatchSchema);

        return {
          ...data,
          created: dayjs.utc(data.created),
          opens: dayjs.utc(data.opens),
          removedAt: data.removedAt ? dayjs.utc(data.removedAt) : null,
        };
      },
    }),
  getPotentialConflicts: (region: string, time: Dayjs, version: string) =>
    queryOptions({
      queryKey: ['potentialConflicts', { region, time, version }],
      queryFn: async (): Promise<Match[]> => {
        const result = await apiClient
          .get('/api/matches/conflicts', {
            searchParams: {
              region,
              opens: time.toISOString(),
              version,
            },
          })
          .json(enforce.isArrayOf(singleMatchSchema));

        return result.map(match => ({
          ...match,
          opens: dayjs.utc(match.opens),
          created: dayjs.utc(match.created),
          removedAt: match.removedAt ? dayjs.utc(match.removedAt) : null,
        }));
      },
    }),
};
