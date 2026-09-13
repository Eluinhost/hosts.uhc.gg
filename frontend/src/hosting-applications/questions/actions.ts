import { createAction } from 'typesafe-redux-helpers';
import { CreateQuizQuestionData, ManageQuizQuestion, QuizQuestion } from '../../models/QuizQuestion';

export const QuizQuestions = {
  fetch: {
    start: createAction('FETCH_QUIZ_QUESTIONS.START'),
    started: createAction('FETCH_QUIZ_QUESTIONS.STARTED'),
    completed: createAction('FETCH_QUIZ_QUESTIONS.COMPLETED', (questions: Array<QuizQuestion>) => ({
      questions,
    })),
  },
  fetchForManagement: {
    start: createAction('FETCH_QUIZ_QUESTIONS_FOR_MANAGEMENT.START'),
    started: createAction('FETCH_QUIZ_QUESTIONS_FOR_MANAGEMENT.STARTED'),
    completed: createAction(
      'FETCH_QUIZ_QUESTIONS_FOR_MANAGEMENT.COMPLETED',
      (questions: Array<ManageQuizQuestion>) => ({
        questions,
      }),
    ),
  },
  create: {
    start: createAction(
      'CREATE_QUIZ_QUESTION.START',
      (payload: { data: CreateQuizQuestionData; onSuccess: () => void }) => payload,
    ),
    started: createAction('CREATE_QUIZ_QUESTION.STARTED', (payload: CreateQuizQuestionData) => ({
      question: payload,
    })),
    completed: createAction('CREATE_QUIZ_QUESTION.COMPLETED', (payload: { id: number }) => payload),
  },
  delete: {
    start: createAction('DELETE_QUIZ_QUESTION.START', (id: QuizQuestion['id']) => ({ id })),
    started: createAction('DELETE_QUIZ_QUESTION.STARTED', (id: QuizQuestion['id']) => ({ id })),
    completed: createAction('DELETE_QUIZ_QUESTION.COMPLETED', (id: QuizQuestion['id']) => ({ id })),
  },
};
