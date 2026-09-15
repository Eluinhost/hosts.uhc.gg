import { Reducer } from 'redux';
import { createReducer } from 'typesafe-redux-helpers';

import { ManageQuizQuestion, QuizQuestion } from '../../models/QuizQuestion';
import { BasicApiCallState, createBasicApiCallReducer } from '../../state/createBasicApiCallReducer';

import { QuizQuestions } from './actions';

export type QuizQuestionsState = {
  questions: BasicApiCallState<Array<QuizQuestion>>;
  questionsForManagement: BasicApiCallState<Array<ManageQuizQuestion>>;
  create: BasicApiCallState<undefined>;
  delete: BasicApiCallState<undefined>;
};

export const reducer: Reducer<QuizQuestionsState> = createReducer<QuizQuestionsState>({
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  questions: undefined!,
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  questionsForManagement: undefined!,
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  create: undefined!,
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  delete: undefined!,
})
  .forProperty(
    'questions',
    createBasicApiCallReducer<Array<QuizQuestion>>([])
      .withStartedAction(QuizQuestions.fetch.started, () => [])
      .withCompletedAction(QuizQuestions.fetch.completed, action => action.payload.questions)
      .build(),
  )
  .forProperty(
    'questionsForManagement',
    createBasicApiCallReducer<Array<ManageQuizQuestion>>([])
      .withStartedAction(QuizQuestions.fetchForManagement.started, () => [])
      .withCompletedAction(QuizQuestions.fetchForManagement.completed, action => action.payload.questions)
      .build(),
  )

  .forProperty(
    'create',
    createBasicApiCallReducer(undefined)
      .withStartedAction(QuizQuestions.create.started, () => undefined)
      .withCompletedAction(QuizQuestions.create.completed, () => undefined)
      .build(),
  )
  .forProperty(
    'delete',
    createBasicApiCallReducer(undefined)
      .withStartedAction(QuizQuestions.delete.started, () => undefined)
      .withCompletedAction(QuizQuestions.delete.completed, () => undefined)
      .build(),
  );
