import { identity } from 'ramda';
import { createSelector } from 'reselect';

import { ApplicationState } from '../../state/ApplicationState';

export const getQuizQuestionsState = createSelector(
  (state: ApplicationState) => state.hostingApplications.quizQuestions,
  identity,
);

export const getQuizQuestionsForManagement = createSelector(
  getQuizQuestionsState,
  state => state.questionsForManagement.data,
);

export const getCreateQuizQuestionApiState = createSelector(getQuizQuestionsState, state => state.create);

export const getDeleteQuizQuestionApiState = createSelector(getQuizQuestionsState, state => state.delete);

export const getFetchQuizQuestionsApiState = createSelector(getQuizQuestionsState, state => state.questions);

export const getFetchQuizQuestionsForManagementApiState = createSelector(
  getQuizQuestionsState,
  state => state.questionsForManagement,
);
