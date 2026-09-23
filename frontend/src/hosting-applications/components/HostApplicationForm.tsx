import { Button, Intent } from '@blueprintjs/core';
import { AddIcon } from '@blueprintjs/icons';
import React, { useMemo } from 'react';

import { FormLabel } from '../../forms/FormLabel';
import { useAppForm } from '../../forms/useAppForm';
import { QuestionType, type QuizQuestion } from '../../models/QuizQuestion';
import { HostApplicationsData } from '../api';

// interface MultiChoiceProps {
//   question: QuizQuestion;
//   value?: number;
//   onChange: (questionId: number, choice: number) => void;
//   isDisabled: boolean;
// }

// const MultiChoice: React.FC<MultiChoiceProps> = ({ question, value, onChange, isDisabled }) => {
//   const handleChange = useCallback(
//     (evt: React.ChangeEvent<HTMLInputElement>) => {
//       onChange(question.id, Number(evt.currentTarget.value));
//     },
//     [question.id, onChange],
//   );
//
//   return (
//     <RadioGroup onChange={handleChange} selectedValue={value}>
//       {question.choices.map(choice => (
//         <Radio key={choice.id} label={choice.text} value={choice.id} disabled={isDisabled} />
//       ))}
//     </RadioGroup>
//   );
// };

// interface FreeTextProps {
//   question: QuizQuestion;
//   value: string;
//   onChange: (questionId: number, text: string) => void;
//   isDisabled: boolean;
// }

// const FreeText: React.FC<FreeTextProps> = ({ question, value, onChange, isDisabled }) => {
//   const handleChange = useCallback(
//     (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
//       onChange(question.id, evt.target.value);
//     },
//     [question.id, onChange],
//   );
//
//   return <TextArea className={Classes.FILL} fill value={value} onChange={handleChange} disabled={isDisabled} />;
// };

interface HostApplicationFormProps {
  questions: Array<QuizQuestion>;
}

export const HostApplicationForm: React.FC<HostApplicationFormProps> = ({ questions }) => {
  const { mutateAsync: createApplication } = HostApplicationsData.mutations.useCreateHostApplication();

  // building defaults based on the actual questions inputted
  const defaults = useMemo(
    () =>
      questions.reduce<Record<string, string>>((acc, question) => {
        const id = question.id.toString(10);
        acc[id] = '';
        return acc;
      }, {}),
    [questions],
  );

  // not using form-level validation as we're better off with per-field validation
  const form = useAppForm({
    defaultValues: defaults,
    onSubmit: async ({ value }) => {
      await createApplication({
        answers: questions.map(({ id, questionType }) => ({
          questionId: id,
          choiceId: questionType === QuestionType.MULTIPLE_CHOICE ? parseInt(value[id], 10) : undefined,
          textAnswer: questionType === QuestionType.TEXT ? value[id] : undefined,
        })),
      });
    },
  });

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      {questions.map(question => (
        <form.Field key={question.id} name={question.id.toString(10)}>
          {field => (
            <FormLabel field={field} label={question.prompt}>
              {question.questionType === QuestionType.MULTIPLE_CHOICE ? (
                <field.SegmentedField
                  field={field}
                  options={question.choices.map(c => ({ label: c.text, value: c.id.toString(10) }))}
                />
              ) : (
                <field.SegmentedField
                  field={field}
                  options={question.choices.map(c => ({ label: c.text, value: c.id.toString(10) }))}
                />
              )}
            </FormLabel>
          )}
        </form.Field>
      ))}

      <form.Subscribe selector={state => state.isSubmitting || state.isInvalid}>
        {disabled => (
          <Button
            type="submit"
            intent={Intent.PRIMARY}
            icon={<AddIcon />}
            disabled={disabled}
            onClick={() => {
              void form.handleSubmit();
            }}
          >
            Submit Application
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
};
