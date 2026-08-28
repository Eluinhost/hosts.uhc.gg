import * as React from 'react';
import { Alert, Button, Classes, Intent, Tag } from '@blueprintjs/core';
import { ManageQuizQuestion } from '../../../models/QuizQuestion';
import { useDispatch } from 'react-redux';
import { useCallback, useState } from 'react';
// import { getDeleteQuizQuestionApiState } from '../selectors';
import { QuizQuestions } from '../actions';

interface ExistingQuizQuestionProps {
  question: ManageQuizQuestion;
}

export const ExistingQuizQuestion = React.memo(function ExistingQuizQuestion({ question }: ExistingQuizQuestionProps) {
  // TODO error + fetching UIs
  // const { error, isFetching } = useSelector(getDeleteQuizQuestionApiState);
  const dispatch = useDispatch();

  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleClick = useCallback(() => {
    setIsAlertOpen(true);
  }, []);

  const handleCancel = useCallback(() => {
    setIsAlertOpen(false);
  }, []);

  const handleConfirm = useCallback(() => {
    setIsAlertOpen(false);
    dispatch(QuizQuestions.delete.start(question.id));
  }, [question.id, dispatch]);

  return (
    <div className={`${Classes.CARD} ${Classes.ELEVATION_1}`} style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong>{question.prompt}</strong>
        <Button icon="trash" intent={Intent.DANGER} minimal onClick={handleClick} />
      </div>

      <Tag minimal style={{ marginTop: 5 }}>
        {question.questionType}
      </Tag>

      {question.questionType === 'multiple choice' && (
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
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
        intent={Intent.DANGER}
      >
        <p>Are you sure you want to delete this question?</p>
      </Alert>
    </div>
  );
});
