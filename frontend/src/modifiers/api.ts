import { Intent } from '@blueprintjs/core';
import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { enforce } from 'vest';

import { apiClient } from '../apiClient';
import { showToast } from '../services/AppToaster';

import type { Modifier } from './Modifier';

const BASE_KEY = 'modifiers';

export const ModifiersData = {
  getAllModifiers: queryOptions({
    queryKey: [BASE_KEY],
    queryFn: ({ signal }): Promise<Modifier[]> =>
      apiClient.get('/api/modifiers', { signal }).json(
        enforce.isArrayOf(
          enforce.shape({
            id: enforce.isNumber(),
            displayName: enforce.isString(),
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
          void showToast({
            intent: Intent.DANGER,
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
              enforce.shape({
                id: enforce.isNumber(),
                displayName: enforce.isString(),
              }),
            ),
        onSuccess: () => {
          void client.invalidateQueries(ModifiersData.getAllModifiers);
        },
        onError: () => {
          void showToast({
            intent: Intent.DANGER,
            message: 'Failed to create new modifier',
          });
        },
      });
    },
  },
};
