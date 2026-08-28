import * as React from 'react';
import { Button, Classes, H5, Intent, Radio, RadioGroup, TextArea } from '@blueprintjs/core';
import { QuizQuestion } from '../../models/QuizQuestion';
import { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getHostApplicationsReviewingState } from '../selectors';
import { HostApplications } from '../actions';

const MultiChoice = React.memo(function Question({
  question,
  value,
  onChange,
  isDisabled,
}: {
  question: QuizQuestion;
  value?: number;
  onChange: (questionId: number, choice: number) => void;
  isDisabled: boolean;
}) {
  const handleChange = useCallback(
    (evt: React.FormEvent<HTMLInputElement>) => {
      onChange(question.id, Number(evt.currentTarget.value));
    },
    [question.id, onChange],
  );

  return (
    <RadioGroup onChange={handleChange} selectedValue={value}>
      {question.choices.map(choice => (
        <Radio key={choice.id} label={choice.text} value={choice.id} disabled={isDisabled} />
      ))}
    </RadioGroup>
  );
});

const FreeText = React.memo(function FreeText({
  question,
  value,
  onChange,
  isDisabled,
}: {
  question: QuizQuestion;
  value: string;
  onChange: (questionId: number, text: string) => void;
  isDisabled: boolean;
}) {
  const handleChange = useCallback(
    (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(question.id, evt.target.value);
    },
    [question.id, onChange],
  );

  return <TextArea className={Classes.FILL} fill value={value} onChange={handleChange} disabled={isDisabled} />;
});

interface HostApplicationFormProps {
  questions: Array<QuizQuestion>;
}

interface AnswerState {
  choiceId?: number;
  textAnswer?: string;
}

type AnswerMap = Record<number, AnswerState>;

export const HostApplicationForm = React.memo(function HostApplicationForm({ questions }: HostApplicationFormProps) {
  const [answers, setAnswers] = useState<AnswerMap>({});

  const dispatch = useDispatch();
  const { isFetching: isSubmitting } = useSelector(getHostApplicationsReviewingState);

  const isComplete = useMemo(
    (): boolean =>
      questions.every(question => {
        const answer = answers[question.id];
        if (!answer) return false;

        return question.questionType === 'multiple choice'
          ? answer.choiceId !== undefined
          : !!answer.textAnswer && answer.textAnswer.trim().length > 0;
      }),
    [answers, questions],
  );

  const handleSubmit = useCallback(() => {
    dispatch(
      HostApplications.create.start(
        questions.map(question => ({
          questionId: question.id,
          choiceId: answers[question.id] && answers[question.id].choiceId,
          textAnswer: answers[question.id] && answers[question.id].textAnswer,
        })),
      ),
    );
  }, [answers, dispatch, questions]);

  const handleChoiceChange = useCallback((questionId: number, choiceId: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: { choiceId } }));
  }, []);

  const handleTextChange = useCallback((questionId: number, textAnswer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: { textAnswer } }));
  }, []);

  return (
    <div>
      {questions.map(question => (
        <div key={question.id} style={{ marginBottom: 20 }}>
          <H5>{question.prompt}</H5>

          {question.questionType === 'multiple choice' ? (
            <MultiChoice
              question={question}
              value={answers[question.id]?.choiceId}
              isDisabled={isSubmitting}
              onChange={handleChoiceChange}
            />
          ) : (
            <FreeText
              question={question}
              value={answers[question.id]?.textAnswer ?? ''}
              isDisabled={isSubmitting}
              onChange={handleTextChange}
            />
          )}
        </div>
      ))}

      <Button
        type="button"
        intent={Intent.PRIMARY}
        icon="add"
        disabled={isSubmitting || !isComplete}
        onClick={handleSubmit}
      >
        Submit Application
      </Button>
    </div>
  );
});
