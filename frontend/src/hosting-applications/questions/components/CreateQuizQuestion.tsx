import { Button, Divider, Group, Modal, Stack } from '@mantine/core';
import { PlusCircleIcon, PlusIcon } from '@phosphor-icons/react';
import type { FieldWithValue } from '@tanstack/react-form';
import { useState } from 'react';
import * as v from 'valibot';

import { ErrorAlert } from '@/forms/components/ErrorAlert';
import { useAppForm, useFormSelector } from '@/forms/useAppForm';
import { QuizQuestionsData } from '@/hosting-applications/questions/api';
import { ChoiceField } from '@/hosting-applications/questions/components/ChoiceField';
import { createQuestionForm } from '@/hosting-applications/questions/components/createQuestionForm';
import { createQuizQuestionSchema } from '@/hosting-applications/questions/components/createQuizQuestionSchema';
import { QuestionType } from '@/hosting-applications/QuestionType';

export const CreateQuizQuestion = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { mutateAsync: createQuestion } = QuizQuestionsData.mutations.useCreateQuizQuestion();

  const form = useAppForm({
    ...createQuestionForm,
    onSubmit: async ({ value, formApi }) => {
      // running parse as tanstack doesn't transform the values, just validates
      await createQuestion(v.parse(createQuizQuestionSchema, value));
      formApi.reset();
      setIsOpen(false);
    },
  });

  const questionType = useFormSelector(form.atom, s => s.values.questionType);

  return (
    <Group justify="end">
      <Button
        color="green"
        leftSection={<PlusIcon size={20} />}
        onClick={() => {
          setIsOpen(true);
        }}
      >
        Add new question
      </Button>
      <Modal
        centered
        size="xl"
        opened={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
        title="Create new question"
      >
        <form
          onSubmit={e => {
            e.preventDefault();
            void form.handleSubmit();
          }}
        >
          <Stack>
            <form.Field name="prompt">
              {field => (
                <field.TextField
                  field={field}
                  size="lg"
                  placeholder="Prompt"
                  leftSectionWidth="10rem"
                  leftSection={
                    <form.Field name="questionType">
                      {field => (
                        <field.SegmentedField
                          field={field as FieldWithValue<string>}
                          data={[
                            { value: QuestionType.MULTIPLE_CHOICE, label: 'Multichoice' },
                            { value: QuestionType.TEXT, label: 'Text' },
                          ]}
                        />
                      )}
                    </form.Field>
                  }
                  rightSectionWidth="9rem"
                  rightSection={
                    questionType === QuestionType.MULTIPLE_CHOICE && (
                      <Button
                        color="green"
                        variant="filled"
                        leftSection={<PlusCircleIcon size={18} />}
                        onClick={() => {
                          form.setFieldValue('choices', prev => [...prev, { text: '', correct: false }]);
                        }}
                      >
                        Add Choice
                      </Button>
                    )
                  }
                />
              )}
            </form.Field>

            <form.ArrayField name="choices">
              {choicesField => {
                if (questionType !== QuestionType.MULTIPLE_CHOICE) {
                  return null;
                }

                return (
                  <Stack align="stretch">
                    {choicesField.value.length > 0 && <Group justify="end"></Group>}
                    {choicesField.value.map((_entry, index) => (
                      <ChoiceField
                        key={index}
                        form={form}
                        index={index}
                        onRemove={() => {
                          choicesField.removeValue(index);
                        }}
                      />
                    ))}
                    <ErrorAlert field={choicesField} />
                  </Stack>
                );
              }}
            </form.ArrayField>

            <Divider mt="sm" mb="sm" />

            <form.Subscribe selector={s => s.canSubmit}>
              {canSubmit => (
                <Button
                  color="green"
                  leftSection={<PlusIcon />}
                  disabled={!canSubmit}
                  onClick={() => {
                    void form.handleSubmit();
                  }}
                >
                  Create Question
                </Button>
              )}
            </form.Subscribe>
          </Stack>
        </form>
      </Modal>
    </Group>
  );
};
