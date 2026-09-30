import { Button, Group, Modal, Stack } from '@mantine/core';
import { PlusIcon, ArrowLeftIcon } from '@phosphor-icons/react';
import * as v from 'valibot';

import { useAppForm } from '@/forms/useAppForm';
import { HostingRulesData } from '@/hosting-rules/api';
import { RulesField } from '@/hosting-rules/components/RulesField';

const schema = v.object({
  rules: v.pipe(v.string(), v.nonEmpty('This field is required'), v.minLength(3, 'Must be at least 3 characters long')),
});

export const SetRulesDialog = ({ current, onClose }: { current: string; onClose: () => void }) => {
  const { mutateAsync } = HostingRulesData.mutations.useSetHostingRules();

  const form = useAppForm({
    defaultValues: { rules: current },
    validators: [
      {
        run: schema,
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
