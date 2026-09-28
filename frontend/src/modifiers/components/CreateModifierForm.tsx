import { ActionIcon } from '@mantine/core';
import { ArrowUpIcon } from '@phosphor-icons/react';
import { create, enforce, test } from 'vest';

import { useAppForm } from '../../forms/useAppForm';
import { ModifiersData } from '../api';

const schema = enforce.shape({
  modifier: enforce.isString(),
});

const suite = create(data => {
  test('modifier', 'This field is required', () => {
    enforce(data.modifier).isString().isNotEmpty();
  });
}, schema);

export const CreateModifierForm = ({ existing }: { existing: Array<string> }) => {
  const { mutateAsync } = ModifiersData.mutations.useCreateModifier();

  const form = useAppForm({
    defaultValues: {
      modifier: '',
    },
    validators: [
      {
        run: suite,
        triggers: ['change'],
      },
      {
        run: ctx => {
          if (existing.includes(ctx.value.modifier.toLowerCase())) {
            return ctx.createErrorMap({
              fields: {
                modifier: 'Modifier already exists',
              },
            });
          }
        },
        triggers: ['change'],
      },
    ],
    onSubmit: async state => {
      await mutateAsync(state.value.modifier);
    },
  });

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <form.Field name="modifier">
        {field => (
          <field.TextField
            field={field}
            size="lg"
            label="Create new modifier"
            required
            rightSection={
              <ActionIcon
                color={field.meta.isValid ? 'green' : 'red'}
                type="submit"
                onClick={() => {
                  void form.handleSubmit();
                }}
                size="lg"
                disabled={!field.meta.isValid}
              >
                <ArrowUpIcon />
              </ActionIcon>
            }
          />
        )}
      </form.Field>
    </form>
  );
};
