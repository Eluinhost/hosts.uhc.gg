import { Title, Stack } from '@mantine/core';
import React from 'react';

import { ShowQuizQuestions } from '@/hosting-applications/questions/components/ShowQuizQuestions';

export const QuizManagementPage: React.FC = () => (
  <Stack justify="center">
    <title>uhc.gg | Host Application Quiz</title>
    <Title order={1} mb="lg" ta="center">
      Host Application Quiz
    </Title>
    <ShowQuizQuestions />
  </Stack>
);
