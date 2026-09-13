import { CreateQuizQuestionData, ManageQuizQuestion, QuizQuestion } from '../../models/QuizQuestion';
import { authHeaders, callApi, fetchArray, fetchObject } from '../../api/util';

export const fetchQuizQuestions = (): Promise<QuizQuestion[]> =>
  fetchArray<QuizQuestion>({
    url: '/api/quiz',
  });

export const fetchQuizQuestionsForManagement = (accessToken: string): Promise<ManageQuizQuestion[]> =>
  fetchArray<ManageQuizQuestion>({
    url: '/api/quiz/manage',
    config: {
      headers: authHeaders(accessToken),
    },
  });

export const createQuizQuestion = (data: CreateQuizQuestionData, accessToken: string): Promise<{ id: number }> =>
  fetchObject<{ id: number }>({
    url: '/api/quiz',
    config: {
      method: 'POST',
      headers: {
        ...authHeaders(accessToken),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    },
    status: 201,
  });

export const deleteQuizQuestion = (id: number, accessToken: string): Promise<void> =>
  callApi({
    url: `/api/quiz/${id}`,
    config: {
      method: 'DELETE',
      headers: authHeaders(accessToken),
    },
    status: 204,
  });
