import { Button, InputWrapper, Stack } from '@mantine/core';
import { PlusIcon } from '@phosphor-icons/react';
import { useNavigate } from '@tanstack/react-router';
import React, { useMemo } from 'react';

import { appFormOptions, useAppForm } from '@/forms/useAppForm';
import { HostApplicationsData } from '@/hosting-applications/api';
import {
  createHostApplicationSchema,
  type CreateHostApplicationSchema,
} from '@/hosting-applications/components/createHostApplicationSchema';
import styles from '@/hosting-applications/components/HostApplicationForm.module.css';
import type { QuizQuestion } from '@/hosting-applications/questions/schema';
import { QuestionType } from '@/hosting-applications/QuestionType';

interface HostApplicationFormProps {
  questions: Array<QuizQuestion>;
}

export const HostApplicationForm: React.FC<HostApplicationFormProps> = ({ questions }) => {
  const { mutateAsync: createApplication } = HostApplicationsData.mutations.useCreateHostApplication();
  const navigate = useNavigate();

  // building defaults based on the actual questions inputted
  const defaults: CreateHostApplicationSchema = useMemo(
    () => ({
      answers: questions.map(question => ({
        questionId: question.id,
        answer: question.questionType === QuestionType.MULTIPLE_CHOICE ? question.choices[0].text : '',
      })),
    }),
    [questions],
  );

  const form = useAppForm(
    appFormOptions.strictSchema(createHostApplicationSchema, {
      defaultValues: defaults,
      validators: [
        {
          run: createHostApplicationSchema,
          triggers: ['change'],
        },
      ],
      onSubmit: async ({ value }) => {
        await createApplication(value);
        void navigate({ to: '/host-applications' });
      },
    }),
  );

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <Stack>
        {questions.map((question, index) => (
          <form.Field name={`answers[${index}].answer`} key={question.id}>
            {field => {
              switch (question.questionType) {
                case QuestionType.MULTIPLE_CHOICE:
                  return (
                    <InputWrapper size="md" error={field.errors[0]?.message} label={question.prompt} required>
                      <field.SegmentedField
                        field={field}
                        fullWidth
                        orientation="vertical"
                        size="md"
                        data={question.choices.map(c => ({ label: c.text, value: c.text }))}
                        classNames={{
                          label: styles.segmentedFieldLabel,
                        }}
                      />
                    </InputWrapper>
                  );
                case QuestionType.TEXT:
                  return (
                    <field.TextField
                      field={field}
                      label={question.prompt}
                      size="md"
                      required
                      placeholder="Enter your answer"
                    />
                  );
              }
            }}
          </form.Field>
        ))}

        <form.Subscribe selector={state => state.isSubmitting || state.isInvalid}>
          {disabled => (
            <Button
              type="submit"
              color="green"
              leftSection={<PlusIcon />}
              disabled={disabled}
              onClick={() => {
                void form.handleSubmit();
              }}
            >
              Submit Application
            </Button>
          )}
        </form.Subscribe>
      </Stack>
    </form>
  );
};
