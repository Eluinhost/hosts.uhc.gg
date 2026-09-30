import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import * as v from 'valibot';

import { apiClient } from '@/apiClient';
import type { Modifier } from '@/modifiers/Modifier';
import { showToast } from '@/services/AppToaster';

const BASE_KEY = 'modifiers';

export const ModifiersData = {
  getAllModifiers: queryOptions({
    queryKey: [BASE_KEY],
    queryFn: ({ signal }): Promise<Modifier[]> =>
      apiClient.get('/api/modifiers', { signal }).json(
        v.array(
          v.object({
            id: v.number(),
            displayName: v.string(),
          }),
        ),
      ),
  }),
  mutations: {
    useDeleteModifier: () => {
      const client = useQueryClient();

      return useMutation({
        mutationFn: async (id: number) => {
          await apiClient.delete(`/api/modifiers/${id}`, { signal: null });
        },
        onSuccess: () => {
          void client.invalidateQueries(ModifiersData.getAllModifiers);
        },
        onError: () => {
          showToast({
            color: 'red',
            message: 'Failed to delete modifier',
          });
        },
      });
    },
    useCreateModifier: () => {
      const client = useQueryClient();

      return useMutation({
        mutationFn: (name: string) =>
          apiClient
            .post('/api/modifiers', {
              body: JSON.stringify(name),
              headers: {
                'content-type': 'application/json',
              },
              signal: null,
            })
            .json(
              v.object({
                id: v.number(),
                displayName: v.string(),
              }),
            ),
        onSuccess: () => {
          void client.invalidateQueries(ModifiersData.getAllModifiers);
        },
        onError: () => {
          showToast({
            color: 'red',
            message: 'Failed to create new modifier',
          });
        },
      });
    },
  },
};
