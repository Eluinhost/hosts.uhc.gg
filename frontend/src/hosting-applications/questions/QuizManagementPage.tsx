import { Title, Stack, Group } from '@mantine/core';
import React from 'react';

import { ShowQuizQuestions } from '@/hosting-applications/questions/components/ShowQuizQuestions';

export const QuizManagementPage: React.FC = () => (
  <Stack>
    <title>uhc.gg | Host Application Quiz</title>
    <Title order={1}>Host Application Quiz</Title>
    <Group m={30}>
      <ShowQuizQuestions />
    </Group>
  </Stack>
);
