import { Stack, EmptyState, Loader, Alert } from '@mantine/core';
import { QuestionIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';

import { QuizQuestionsData } from '@/hosting-applications/questions/api';
import { CreateQuizQuestion } from '@/hosting-applications/questions/components/CreateQuizQuestion';
import { ExistingQuizQuestion } from '@/hosting-applications/questions/components/ExistingQuizQuestion';

export const ShowQuizQuestions = () => {
  const { data, isFetching, error } = useQuery(QuizQuestionsData.getQuestions);

  let top;
  if (error) {
    top = <Alert color="red" title={`Error: ${error.message}`} />;
  } else if (isFetching) {
    top = <EmptyState icon={<Loader />} title="Loading...." />;
  } else if (data && data.length === 0) {
    top = <EmptyState icon={<QuestionIcon />} title="No questions setup" />;
  } else {
    top = (
      <div>
        {data?.map((question, index) => (
          <ExistingQuizQuestion question={question} key={question.id} index={index} />
        ))}
      </div>
    );
  }

  return (
    <Stack>
      {top}
      <CreateQuizQuestion />
    </Stack>
  );
};
