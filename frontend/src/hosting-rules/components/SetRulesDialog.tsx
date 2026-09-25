import { Button, Group, Modal, Stack } from '@mantine/core';
import { PlusIcon, ArrowLeftIcon } from '@phosphor-icons/react';
import { create, enforce, test } from 'vest';

import { useAppForm } from '../../forms/useAppForm';
import { HostingRulesData } from '../api';

import { RulesField } from './RulesField';

const schema = enforce.shape({
  rules: enforce.isString(),
});

const suite = create(data => {
  test('rules', 'This field is required', () => {
    enforce(data.rules).isString().isNotEmpty();
  });
  test('rules', 'Must be at least 3 characters long', () => {
    enforce(data.rules).isString().min(3);
  });
}, schema);

export const SetRulesDialog = ({ current, onClose }: { current: string; onClose: () => void }) => {
  const { mutateAsync } = HostingRulesData.mutations.useSetHostingRules();

  const form = useAppForm({
    defaultValues: { rules: current },
    validators: [
      {
        run: suite,
        triggers: ['change'],
      },
    ],
    onSubmit: async state => {
      await mutateAsync(state.value.rules);
      onClose();
    },
  });

  return (
    <Modal opened onClose={onClose} title="Modify Rules" centered size="lg">
      <Stack
        component="form"
        onSubmit={e => {
          e.preventDefault();
          void form.handleSubmit();
        }}
      >
        <form.Field name="rules">{field => <RulesField field={field} />}</form.Field>

        <Group justify="end">
          <Button variant="light" color="red" onClick={onClose} leftSection={<ArrowLeftIcon />}>
            Cancel
          </Button>
          <form.Subscribe selector={state => state.canSubmit}>
            {canSubmit => (
              <Button
                variant="light"
                color="green"
                onClick={() => void form.handleSubmit()}
                disabled={!canSubmit}
                leftSection={<PlusIcon />}
              >
                Update Rules
              </Button>
            )}
          </form.Subscribe>
        </Group>
      </Stack>
    </Modal>
  );
};
