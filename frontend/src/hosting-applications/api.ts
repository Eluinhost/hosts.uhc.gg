import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { enforce } from 'vest';

import { apiClient } from '../apiClient';
import { isValueOf } from '../forms/rules';

import { HostApplicationStatus, type SubmitAnswerData } from './HostApplication';

const commonFields = {
  id: enforce.isNumber(),
  username: enforce.isString(),
  created: enforce.isString(),
  status: isValueOf(HostApplicationStatus),
  reviewedBy: enforce.anyOf(enforce.isString(), enforce.isNull()),
  reviewedAt: enforce.anyOf(enforce.isString(), enforce.isNull()),
  reviewReason: enforce.anyOf(enforce.isString(), enforce.isNull()),
};

const hostApplication = enforce.shape(commonFields);

const hostApplicationAnswer = enforce.shape({
  questionPrompt: enforce.isString(),
  questionType: enforce.isString().inside(['multiple choice', 'text']),
  choiceText: enforce.anyOf(enforce.isString(), enforce.isNull()),
  choiceCorrect: enforce.anyOf(enforce.isBoolean(), enforce.isNull()),
  textAnswer: enforce.anyOf(enforce.isString(), enforce.isNull()),
});

const hostApplicationDetails = enforce.shape({
  ...commonFields,
  answers: enforce.isArrayOf(hostApplicationAnswer),
});

export const HostApplicationsData = {
  getAll: queryOptions({
    queryKey: ['hostApplications', 'list'],
    queryFn: () => apiClient.get('/api/host-applications').json(enforce.isArrayOf(hostApplication)),
  }),
  getById: (id: number) =>
    queryOptions({
      queryKey: ['hostApplications', 'byId', id],
      queryFn: () => apiClient.get(`/api/host-applications/${id}`).json(hostApplicationDetails),
    }),
  mutations: {
    useCreateHostApplication: () => {
      const client = useQueryClient();

      return useMutation({
        mutationFn: ({ answers }: { answers: SubmitAnswerData[] }) =>
          apiClient.post('/api/host-applications', {
            body: JSON.stringify({ answers }),
            headers: { 'Content-Type': 'application/json' },
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
          }),
        onSuccess: () => {
          void client.invalidateQueries(HostApplicationsData.getAll);
        },
      });
    },
  },
};
