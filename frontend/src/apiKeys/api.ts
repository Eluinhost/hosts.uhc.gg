import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { enforce } from 'vest';

import { apiClient } from '../apiClient';

export const ApiKeysData = {
  apiKey: queryOptions({
    queryKey: ['apiKey'],
    queryFn: ({ signal }) =>
      apiClient.get('/api/key', { signal }).json(
        enforce.shape({
          key: enforce.anyOf(enforce.isString(), enforce.isNull()),
        }),
      ),
  }),
  mutations: {
    useRegenerateApiKey: () => {
      const client = useQueryClient();

      return useMutation({
        mutationFn: async () => {
          const result = await apiClient.post('/api/key', { signal: null }).json(
            enforce.shape({
              key: enforce.isString(),
            }),
          );

          client.setQueryData(ApiKeysData.apiKey.queryKey, result);
        },
      });
    },
  },
};
