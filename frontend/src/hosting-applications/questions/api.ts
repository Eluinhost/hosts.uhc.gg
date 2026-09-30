import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import * as v from 'valibot';

import { apiClient } from '@/apiClient';
import dayjs from '@/dayjs';
import { type CreateQuizQuestionData, QuestionType } from '@/models/QuizQuestion';

const quizChoiceSchema = v.object({
  id: v.number(),
  text: v.string(),
});

const manageQuizChoiceSchema = v.object({
  ...quizChoiceSchema.entries,
  correct: v.boolean(),
});

const commonQuizQuestionSchema = v.object({
  id: v.number(),
  prompt: v.string(),
  questionType: v.enum(QuestionType),
});

const quizQuestionSchema = v.object({
  ...commonQuizQuestionSchema.entries,
  choices: v.array(quizChoiceSchema),
});

const manageQuizQuestionSchema = v.object({
  ...commonQuizQuestionSchema.entries,
  prompt: v.string(),
  createdBy: v.string(),
  created: v.pipe(
    v.string(),
    v.transform(value => dayjs.utc(value)),
  ),
  choices: v.array(manageQuizChoiceSchema),
});

export const QuizQuestionsData = {
  getQuestions: queryOptions({
    queryKey: ['quizQuestions', 'nonManagement'],
    queryFn: ({ signal }) => apiClient.get('/api/quiz', { signal }).json(v.array(quizQuestionSchema)),
  }),
  getQuestionsForManagement: queryOptions({
    queryKey: ['quizQuestions', 'management'],
    queryFn: async ({ signal }) =>
      await apiClient.get('/api/quiz/manage', { signal }).json(v.array(manageQuizQuestionSchema)),
  }),
  mutations: {
    useCreateQuizQuestion: () => {
      const client = useQueryClient();

      return useMutation({
        mutationFn: (data: CreateQuizQuestionData) =>
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
          void client.invalidateQueries(QuizQuestionsData.getQuestionsForManagement);
        },
      });
    },
    useDeleteQuizQuestion: () => {
      const client = useQueryClient();

      return useMutation({
        mutationFn: ({ id }: { id: number }) => apiClient.delete(`/api/quiz/${id}`, { signal: null }),
        onSuccess: () => {
          void client.invalidateQueries(QuizQuestionsData.getQuestions);
          void client.invalidateQueries(QuizQuestionsData.getQuestionsForManagement);
        },
      });
    },
  },
};
