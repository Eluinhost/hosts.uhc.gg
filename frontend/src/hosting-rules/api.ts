import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { enforce } from 'vest';

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
    queryFn: async (): Promise<HostingRules> => {
      const response = await apiClient.get('/api/rules').json(
        enforce.shape({
          id: enforce.isNumber(),
          content: enforce.isString(),
          modified: enforce.isString(),
          author: enforce.isString(),
        }),
      );

      return {
        ...response,
        modified: dayjs.utc(response.modified),
      };
    },
  }),
  mutations: {
    useSetHostingRules: () => {
      const client = useQueryClient();

      return useMutation({
        mutationFn: async (content: string): Promise<void> => {
          await apiClient.post('/api/rules', {
            body: JSON.stringify(content),
            headers: { 'Content-Type': 'application/json' },
          });
        },
        onSuccess: () => {
          void client.invalidateQueries(HostingRulesData.fetchHostingRules);
        },
      });
    },
  },
};
