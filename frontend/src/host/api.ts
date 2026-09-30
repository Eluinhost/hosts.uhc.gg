import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';

import { apiClient } from '../apiClient';
import { usernameAtom } from '../atoms/authentication';
import { MatchesData } from '../matches/api';

import type { CreateMatchData } from './schema';

export const HostApi = {
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
  },
};
