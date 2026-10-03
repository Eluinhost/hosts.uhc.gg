import { ActionIcon, Group } from '@mantine/core';
import { CheckIcon, TrashIcon, XIcon } from '@phosphor-icons/react';

import type { CreateQuestionForm } from '@/hosting-applications/questions/components/createQuestionForm';
import { QuestionType } from '@/hosting-applications/QuestionType';

export interface ChoiceFieldProps {
  form: CreateQuestionForm;
  index: number;
  onRemove: () => void;
}

export const ChoiceField = ({ form, onRemove, index }: ChoiceFieldProps) => {
  return (
    <Group align="start">
      <form.Field name={`choices[${index}].text`}>
        {field => (
          <field.TextField
            flex={1}
            field={field}
            placeholder="Choice text"
            required
            leftSectionWidth="4rem"
            leftSection={
              <Group p="md">
                <form.Field
                  name={`choices[${index}].correct`}
                  listeners={[
                    {
                      triggers: ['blur'],
                      run: ({ formApi, fieldApi }) => {
                        if (formApi.state.values.questionType !== QuestionType.MULTIPLE_CHOICE) {
                          return;
                        }

                        const isNowSelected = fieldApi.value;

                        if (isNowSelected) {
                          // unset every other field
                          for (let i = 0; i < formApi.state.values.choices.length; i++) {
                            if (i !== index) {
                              formApi.setFieldValue(`choices[${i}].correct`, false);
                            }
                          }
                        } else {
                          // now unselected, select the first item (if this is the first item pick the second if it exists)
                          const target = index === 0 ? Math.min(1, formApi.state.values.choices.length - 1) : 0;

                          formApi.setFieldValue(`choices[${target}].correct`, true);
                        }
                      },
                    },
                  ]}
                >
                  {field => (
                    <field.SwitchField
                      size="md"
                      field={field}
                      color="green"
                      onLabel={<CheckIcon size={18} />}
                      offLabel={<XIcon size={18} />}
                    />
                  )}
                </form.Field>
              </Group>
            }
            rightSection={
              <ActionIcon
                color="red"
                onClick={() => {
                  onRemove();
                }}
              >
                <TrashIcon />
              </ActionIcon>
            }
          />
        )}
      </form.Field>
    </Group>
  );
};
