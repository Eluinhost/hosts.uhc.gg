import { Badge, Blockquote, Group, Stack, Text } from '@mantine/core';
import { CheckIcon, InfoIcon, XIcon } from '@phosphor-icons/react';

import type { HostApplicationAnswer } from '@/hosting-applications/api';

interface ApplicationAnswerProps {
  answer: HostApplicationAnswer;
}

export const ApplicationAnswer = ({ answer }: ApplicationAnswerProps) => {
  const color = answer.choiceCorrect === null ? 'blue' : answer.choiceCorrect ? 'green' : 'red';
  const icon =
    answer.choiceCorrect === null ? (
      <InfoIcon size={12} />
    ) : answer.choiceCorrect ? (
      <CheckIcon size={12} />
    ) : (
      <XIcon size={12} />
    );

  return (
    <Stack>
      <Group>
        <Text fw={700} size="lg">
          {answer.prompt}
        </Text>
        {answer.choiceCorrect !== null && (
          <Badge color={answer.choiceCorrect ? 'green' : 'red'}>{answer.choiceCorrect ? 'correct' : 'incorrect'}</Badge>
        )}
      </Group>

      <Blockquote icon={icon} iconSize={20} color={color}>
        {answer.answer}
      </Blockquote>
    </Stack>
  );
};
