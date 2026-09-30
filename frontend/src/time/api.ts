import { queryOptions } from '@tanstack/react-query';
import * as v from 'valibot';

import { apiClient } from '@/apiClient';
import dayjs from '@/dayjs';

export const TimeData = {
  serverOffset: queryOptions({
    queryKey: ['serverOffset'],
    queryFn: async ({ signal }) => {
      const result = await apiClient.get('/api/sync', { signal }).json(v.string());
      return dayjs.utc(result).diff(dayjs.utc());
    },
    // keep in sync every 2 minutes
    refetchInterval: 1000 * 60 * 2,
  }),
};
