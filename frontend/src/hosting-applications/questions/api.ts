import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import * as v from 'valibot';

import { apiClient } from '@/apiClient';
import { createQuizQuestionSchema } from '@/hosting-applications/questions/components/createQuizQuestionSchema';
import { quizQuestionSchema } from '@/hosting-applications/questions/schema';

export const QuizQuestionsData = {
  getQuestions: queryOptions({
    queryKey: ['quizQuestions', 'nonManagement'],
    queryFn: ({ signal }) => apiClient.get('/api/quiz', { signal }).json(v.array(quizQuestionSchema)),
  }),
  mutations: {
    useCreateQuizQuestion: () => {
      const client = useQueryClient();

      return useMutation({
        mutationFn: (data: v.InferOutput<typeof createQuizQuestionSchema>) =>
          apiClient
            .post('/api/quiz', {
              body: JSON.stringify(data),
              headers: { 'Content-Type': 'application/json' },
              signal: null,
            })
            .json(
              v.object({
                id: v.number(),
              }),
            ),
        onSuccess: () => {
          void client.invalidateQueries(QuizQuestionsData.getQuestions);
        },
      });
    },
    useDeleteQuizQuestion: () => {
      const client = useQueryClient();

      return useMutation({
        mutationFn: ({ id }: { id: number }) => apiClient.delete(`/api/quiz/${id}`, { signal: null }),
        onSuccess: () => {
          void client.invalidateQueries(QuizQuestionsData.getQuestions);
        },
      });
    },
  },
};
