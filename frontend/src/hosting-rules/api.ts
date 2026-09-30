import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import * as v from 'valibot';

import { apiClient } from '../apiClient';
import dayjs, { type Dayjs } from '../dayjs';

export type HostingRules = {
  content: string;
  modified: Dayjs;
  author: string;
};

export const HostingRulesData = {
  fetchHostingRules: queryOptions({
    queryKey: ['hostingRules'],
    queryFn: async ({ signal }): Promise<HostingRules> =>
      apiClient.get('/api/rules', { signal }).json(
        v.object({
          id: v.number(),
          content: v.string(),
          modified: v.pipe(
            v.string(),
            v.transform(value => dayjs.utc(value)),
          ),
          author: v.string(),
        }),
      ),
  }),
  mutations: {
    useSetHostingRules: () => {
      const client = useQueryClient();

      return useMutation({
        mutationFn: async (content: string): Promise<void> => {
          await apiClient.post('/api/rules', {
            body: JSON.stringify(content),
            headers: { 'Content-Type': 'application/json' },
            signal: null,
          });
        },
        onSuccess: () => {
          void client.invalidateQueries(HostingRulesData.fetchHostingRules);
        },
      });
    },
  },
};
