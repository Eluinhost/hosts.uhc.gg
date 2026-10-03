import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import * as v from 'valibot';

import { apiClient } from '@/apiClient';
import type { CreateHostApplicationSchema } from '@/hosting-applications/components/createHostApplicationSchema';
import { HostApplicationStatus } from '@/hosting-applications/HostApplication';
import { QuestionType } from '@/hosting-applications/QuestionType';

const hostApplication = v.object({
  id: v.number(),
  username: v.string(),
  created: v.string(),
  status: v.enum(HostApplicationStatus),
  reviewedBy: v.nullable(v.string()),
  reviewedAt: v.nullable(v.string()),
  reviewReason: v.nullable(v.string()),
});

const hostApplicationAnswer = v.object({
  prompt: v.string(),
  questionType: v.pipe(v.string(), v.enum(QuestionType)),
  answer: v.string(),
  choiceCorrect: v.nullable(v.boolean()),
});

const hostApplicationDetails = v.object({
  ...hostApplication.entries,
  answers: v.array(hostApplicationAnswer),
});

export const HostApplicationsData = {
  getAll: queryOptions({
    queryKey: ['hostApplications', 'list'],
    queryFn: ({ signal }) => apiClient.get('/api/host-applications', { signal }).json(v.array(hostApplication)),
  }),
  getById: (id: number) =>
    queryOptions({
      queryKey: ['hostApplications', 'byId', id],
      queryFn: ({ signal }) => apiClient.get(`/api/host-applications/${id}`, { signal }).json(hostApplicationDetails),
    }),
  mutations: {
    useCreateHostApplication: () => {
      const client = useQueryClient();

      return useMutation({
        mutationFn: (data: CreateHostApplicationSchema) =>
          apiClient.post('/api/host-applications', {
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
            signal: null,
          }),
        onSuccess: () => {
          void client.invalidateQueries(HostApplicationsData.getAll);
        },
      });
    },
    useReviewHostApplication: () => {
      const client = useQueryClient();

      return useMutation({
        mutationFn: ({ id, decision, reason }: { id: number; decision: 'approve' | 'decline'; reason?: string }) =>
          apiClient.post(`/api/host-applications/${id}/${decision}`, {
            body: JSON.stringify({ reason }),
            headers: { 'Content-Type': 'application/json' },
            signal: null,
          }),
        onSuccess: () => {
          void client.invalidateQueries(HostApplicationsData.getAll);
        },
      });
    },
  },
};
