import { Button, ControlGroup, Intent } from '@blueprintjs/core';
import { ArrowUpIcon } from '@phosphor-icons/react';
import { create, enforce, test } from 'vest';

import { FormLabel } from '../../forms/FormLabel';
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
          <FormLabel field={field} label="Create new modifier" showRequiredStar>
            <ControlGroup>
              <field.TextField field={field} size="large" />
              <form.Subscribe selector={state => state.isValid}>
                {valid => (
                  <Button
                    intent={valid ? Intent.SUCCESS : Intent.DANGER}
                    type="submit"
                    onClick={() => {
                      void form.handleSubmit();
                    }}
                    icon={<ArrowUpIcon />}
                    size="large"
                    disabled={!valid}
                  />
                )}
              </form.Subscribe>
            </ControlGroup>
          </FormLabel>
        )}
      </form.Field>
    </form>
  );
};
