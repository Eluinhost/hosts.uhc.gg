import { createReducer } from 'typesafe-redux-helpers';
import { Reducer } from 'redux';

import { ManageQuizQuestion, QuizQuestion } from '../../models/QuizQuestion';
import { QuizQuestions } from './actions';
import { BasicApiCallState, createBasicApiCallReducer } from '../../state/createBasicApiCallReducer';

export type QuizQuestionsState = {
  questions: BasicApiCallState<Array<QuizQuestion>>;
  questionsForManagement: BasicApiCallState<Array<ManageQuizQuestion>>;
  create: BasicApiCallState<undefined>;
  delete: BasicApiCallState<undefined>;
};

export const reducer: Reducer<QuizQuestionsState> = createReducer<QuizQuestionsState>({
  questions: undefined!,
  questionsForManagement: undefined!,
  create: undefined!,
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
