import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import * as v from 'valibot';

import { apiClient } from '@/apiClient';

export const ApiKeysData = {
  apiKey: queryOptions({
    queryKey: ['apiKey'],
    queryFn: ({ signal }) =>
      apiClient.get('/api/key', { signal }).json(
        v.object({
          key: v.nullable(v.string()),
        }),
      ),
  }),
  mutations: {
    useRegenerateApiKey: () => {
      const client = useQueryClient();

      return useMutation({
        mutationFn: async () => {
          const result = await apiClient.post('/api/key', { signal: null }).json(
            v.object({
              key: v.string(),
            }),
          );

          client.setQueryData(ApiKeysData.apiKey.queryKey, result);
        },
      });
    },
  },
};
