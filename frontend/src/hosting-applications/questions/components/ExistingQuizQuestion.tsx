import { Button, Badge, Stack, Modal, Group, Card, List, Title, ActionIcon } from '@mantine/core';
import { TrashIcon } from '@phosphor-icons/react';
import React, { useState } from 'react';

import { QuizQuestionsData } from '@/hosting-applications/questions/api';
import styles from '@/hosting-applications/questions/components/ExistingQuizQuestion.module.css';
import type { QuizQuestion } from '@/hosting-applications/questions/schema';
import { QuestionType } from '@/hosting-applications/QuestionType';

interface ExistingQuizQuestionProps {
  question: QuizQuestion;
  index: number;
}

export const ExistingQuizQuestion: React.FC<ExistingQuizQuestionProps> = ({ question, index }) => {
  // TODO error + fetching UIs
  const { mutate: deleteQuestion } = QuizQuestionsData.mutations.useDeleteQuizQuestion();

  const [isAlertOpen, setIsAlertOpen] = useState(false);

  return (
    <Card withBorder mb={10}>
      <Stack align="stretch">
        <Group justify="space-between" align="center">
          <Group>
            <Badge size="xl" fw={700} color="blue">
              #{index + 1}
            </Badge>
            <Title order={3}>{question.prompt}</Title>
          </Group>

          <Group>
            <Badge size="lg" color="blue">
              {question.questionType}
            </Badge>

            <ActionIcon
              bdrs={100}
              color="red"
              onClick={() => {
                setIsAlertOpen(true);
              }}
            >
              <TrashIcon />
            </ActionIcon>
          </Group>
        </Group>

        {question.questionType === QuestionType.MULTIPLE_CHOICE && (
          <List withPadding={false} listStyleType="none">
            {question.choices.map(choice => (
              <List.Item
                key={choice.id}
                mt="xs"
                styles={{ itemWrapper: { width: '100%' }, itemLabel: { width: '100%' } }}
              >
                <Card withBorder className={choice.correct ? styles.correct : styles.incorrect}>
                  <Group justify="space-between">
                    {choice.text} {choice.correct && <Badge color="green">correct</Badge>}
                  </Group>
                </Card>
              </List.Item>
            ))}
          </List>
        )}
      </Stack>
      <Modal
        opened={isAlertOpen}
        onClose={() => {
          setIsAlertOpen(false);
        }}
        centered
      >
        <Stack>
          <p>Are you sure you want to delete this question?</p>
        </Stack>
        <Group justify="end">
          <Button
            variant="subtle"
            onClick={() => {
              setIsAlertOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button
            color="red"
            onClick={() => {
              setIsAlertOpen(false);
              deleteQuestion({ id: question.id });
            }}
          >
            Delete
          </Button>
        </Group>
      </Modal>
    </Card>
  );
};
