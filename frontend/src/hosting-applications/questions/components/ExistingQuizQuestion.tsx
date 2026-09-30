import { Button, Badge, Stack, Modal, Group, Card, List } from '@mantine/core';
import { TrashIcon } from '@phosphor-icons/react';
import React, { useState } from 'react';

import { QuizQuestionsData } from '@/hosting-applications/questions/api';
import { type ManageQuizQuestion, QuestionType } from '@/models/QuizQuestion';

interface ExistingQuizQuestionProps {
  question: ManageQuizQuestion;
}

export const ExistingQuizQuestion: React.FC<ExistingQuizQuestionProps> = ({ question }) => {
  // TODO error + fetching UIs
  const { mutate: deleteQuestion } = QuizQuestionsData.mutations.useDeleteQuizQuestion();

  const [isAlertOpen, setIsAlertOpen] = useState(false);

  return (
    <Card withBorder mb={10}>
      <Group justify="space-between" align="center">
        <strong>{question.prompt}</strong>
        <Button
          leftSection={<TrashIcon />}
          color="red"
          onClick={() => {
            setIsAlertOpen(true);
          }}
        />
      </Group>

      <Badge>{question.questionType}</Badge>

      {question.questionType === QuestionType.MULTIPLE_CHOICE && (
        <List unstyled>
          {question.choices.map(choice => (
            <List.Item key={choice.id}>
              {choice.text} {choice.correct && <Badge color="green">correct</Badge>}
            </List.Item>
          ))}
        </List>
      )}

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
