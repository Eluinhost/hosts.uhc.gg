import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { enforce } from 'vest';

import { apiClient } from '../../apiClient';
import dayjs from '../../dayjs';
import { isValueOf } from '../../forms/rules';
import { type CreateQuizQuestionData, QuestionType } from '../../models/QuizQuestion';

const commonQuizChoiceFields = {
  id: enforce.isNumber(),
  text: enforce.isString(),
};

const quizChoiceSchema = enforce.shape(commonQuizChoiceFields);

const manageQuizChoiceSchema = enforce.shape({
  ...commonQuizChoiceFields,
  correct: enforce.isBoolean(),
});

const commonQuizQuestionFields = {
  id: enforce.isNumber(),
  prompt: enforce.isString(),
  questionType: isValueOf(QuestionType),
};

const quizQuestionSchema = enforce.shape({
  ...commonQuizQuestionFields,
  choices: enforce.isArrayOf(quizChoiceSchema),
});

const manageQuizQuestionSchema = enforce.shape({
  ...commonQuizQuestionFields,
  prompt: enforce.isString(),
  createdBy: enforce.isString(),
  created: enforce.isString(),
  choices: enforce.isArrayOf(manageQuizChoiceSchema),
});

export const QuizQuestionsData = {
  getQuestions: queryOptions({
    queryKey: ['quizQuestions', 'nonManagement'],
    queryFn: ({ signal }) => apiClient.get('/api/quiz', { signal }).json(enforce.isArrayOf(quizQuestionSchema)),
  }),
  getQuestionsForManagement: queryOptions({
    queryKey: ['quizQuestions', 'management'],
    queryFn: async ({ signal }) => {
      const data = await apiClient
        .get('/api/quiz/manage', { signal })
        .json(enforce.isArrayOf(manageQuizQuestionSchema));

      return data.map(x => ({ ...x, created: dayjs.utc(x.created) }));
    },
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
              enforce.shape({
                id: enforce.isNumber(),
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
