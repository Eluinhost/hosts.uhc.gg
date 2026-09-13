import { createSelector, Selector } from 'reselect';
import { ApplicationState } from '../../state/ApplicationState';
import { identity } from 'ramda';
import { QuizQuestionsState } from './reducer';
import { ManageQuizQuestion, QuizQuestion } from '../../models/QuizQuestion';
import { BasicApiCallState } from '../../state/createBasicApiCallReducer';

export const getQuizQuestionsState: Selector<ApplicationState, QuizQuestionsState> = createSelector(
  state => state.hostingApplications.quizQuestions,
  identity,
);

export const getQuizQuestionsForManagement: Selector<ApplicationState, Array<ManageQuizQuestion>> = createSelector(
  getQuizQuestionsState,
  state => state.questionsForManagement.data,
);

export const getCreateQuizQuestionApiState: Selector<ApplicationState, BasicApiCallState<undefined>> = createSelector(
  getQuizQuestionsState,
  state => state.create,
);

export const getDeleteQuizQuestionApiState: Selector<ApplicationState, BasicApiCallState<undefined>> = createSelector(
  getQuizQuestionsState,
  state => state.delete,
);

export const getFetchQuizQuestionsApiState: Selector<
  ApplicationState,
  BasicApiCallState<Array<QuizQuestion>>
> = createSelector(getQuizQuestionsState, state => state.questions);

export const getFetchQuizQuestionsForManagementApiState: Selector<
  ApplicationState,
  BasicApiCallState<Array<ManageQuizQuestion>>
> = createSelector(getQuizQuestionsState, state => state.questionsForManagement);
