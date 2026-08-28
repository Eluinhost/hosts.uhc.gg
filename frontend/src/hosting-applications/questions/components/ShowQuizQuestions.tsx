import * as React from 'react';
import { Classes, H3, H5, NonIdealState, Spinner } from '@blueprintjs/core';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CreateQuizQuestionForm } from './CreateQuizQuestionForm';
import { ExistingQuizQuestion } from './ExistingQuizQuestion';
import { getFetchQuizQuestionsForManagementApiState, getQuizQuestionsForManagement } from '../selectors';
import { QuizQuestions } from '../actions';

export const ShowQuizQuestions = React.memo(function ShowQuizQuestionsComponent() {
  const { isFetching, error } = useSelector(getFetchQuizQuestionsForManagementApiState);
  const questions = useSelector(getQuizQuestionsForManagement);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(QuizQuestions.fetchForManagement.start());
  }, [dispatch]);

  let top;
  if (error) {
    top = (
      <div className={`${Classes.CALLOUT} ${Classes.INTENT_DANGER}`}>
        <H5>Error: {error}</H5>
      </div>
    );
  } else if (isFetching) {
    top = <NonIdealState icon={<Spinner />} title="Loading...." />;
  } else if (questions.length === 0) {
    top = <NonIdealState icon="help" title="No questions setup" />;
  } else {
    top = (
      <div>
        {questions.map(question => (
          <ExistingQuizQuestion question={question} key={question.id} />
        ))}
      </div>
    );
  }

  return (
    <div>
      {top}

      <H3>Create new question</H3>
      <CreateQuizQuestionForm />
    </div>
  );
});
