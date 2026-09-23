import { Classes, H3, H5, NonIdealState, Spinner } from '@blueprintjs/core';
import { HelpIcon } from '@blueprintjs/icons';
import { useQuery } from '@tanstack/react-query';

import { QuizQuestionsData } from '../api';

import { CreateQuizQuestionForm } from './CreateQuizQuestionForm';
import { ExistingQuizQuestion } from './ExistingQuizQuestion';

export const ShowQuizQuestions = () => {
  const { data, isFetching, error } = useQuery(QuizQuestionsData.getQuestionsForManagement);

  let top;
  if (error) {
    top = (
      <div className={`${Classes.CALLOUT} ${Classes.INTENT_DANGER}`}>
        <H5>Error: {error.message}</H5>
      </div>
    );
  } else if (isFetching) {
    top = <NonIdealState icon={<Spinner />} title="Loading...." />;
  } else if (data && data.length === 0) {
    top = <NonIdealState icon={<HelpIcon />} title="No questions setup" />;
  } else {
    top = (
      <div>
        {data?.map(question => (
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
};
