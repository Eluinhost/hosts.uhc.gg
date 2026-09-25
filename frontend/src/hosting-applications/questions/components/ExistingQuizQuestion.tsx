import { Alert, Button, Classes, Intent, Tag } from '@blueprintjs/core';
import { TrashIcon } from '@phosphor-icons/react';
import React, { useState } from 'react';

import { type ManageQuizQuestion, QuestionType } from '../../../models/QuizQuestion';
import { QuizQuestionsData } from '../api';

interface ExistingQuizQuestionProps {
  question: ManageQuizQuestion;
}

export const ExistingQuizQuestion: React.FC<ExistingQuizQuestionProps> = ({ question }) => {
  // TODO error + fetching UIs
  const { mutate: deleteQuestion } = QuizQuestionsData.mutations.useDeleteQuizQuestion();

  const [isAlertOpen, setIsAlertOpen] = useState(false);

  return (
    <div className={`${Classes.CARD} ${Classes.ELEVATION_1}`} style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong>{question.prompt}</strong>
        <Button
          icon={<TrashIcon />}
          intent={Intent.DANGER}
          variant="minimal"
          onClick={() => {
            setIsAlertOpen(true);
          }}
        />
      </div>

      <Tag minimal style={{ marginTop: 5 }}>
        {question.questionType}
      </Tag>

      {question.questionType === QuestionType.MULTIPLE_CHOICE && (
        <ul>
          {question.choices.map(choice => (
            <li key={choice.id}>
              {choice.text} {choice.correct && <Tag intent={Intent.SUCCESS}>correct</Tag>}
            </li>
          ))}
        </ul>
      )}

      <Alert
        isOpen={isAlertOpen}
        onConfirm={() => {
          setIsAlertOpen(false);
          deleteQuestion({ id: question.id });
        }}
        onCancel={() => {
          setIsAlertOpen(false);
        }}
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
        intent={Intent.DANGER}
      >
        <p>Are you sure you want to delete this question?</p>
      </Alert>
    </div>
  );
};
