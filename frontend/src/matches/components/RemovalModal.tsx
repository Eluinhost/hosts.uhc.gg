import { Button, Group, Modal, Stack, Title } from '@mantine/core';
import { ArrowLeftIcon, TrashIcon } from '@phosphor-icons/react';
import React from 'react';
import { enforce, test, create } from 'vest';

import { useAppForm } from '../../forms/useAppForm';
import { MatchesData } from '../../matches/api';
import { showToast } from '../../services/AppToaster';

const schema = enforce.shape({
  reason: enforce.isString(),
});

const suite = create(data => {
  test('reason', 'This field is required', () => {
    enforce(data.reason).isString().min(1);
  });
  test('reason', 'Must be at least 3 characters long', () => {
    enforce(data.reason).isString().min(3);
  });
  test('reason', 'Must be at most 256 characters long', () => {
    enforce(data.reason).isString().max(256);
  });
}, schema);

export const RemovalModal: React.FC<{ id: number; onClose: () => void }> = ({ id, onClose }) => {
  const { mutateAsync } = MatchesData.mutations.useRemoveMatch();

  const form = useAppForm({
    defaultValues: { reason: '' },
    validators: [
      {
        run: suite,
        triggers: ['change'],
      },
    ],
    onSubmit: async ({ value, createValidationError }) => {
      console.log('Submitting removal form with reason:', value.reason);
      try {
        await mutateAsync({ id, reason: value.reason });
        showToast({ color: 'green', message: `Removed match #${id}` });

        onClose();
      } catch {
        showToast({
          message: `Failed to remove match #${id}`,
          color: 'red',
        });

        return createValidationError(`Failed to remove match #${id}`);
      }
    },
  });

  return (
    <Modal opened onClose={onClose} title="Remove match" size="md" centered>
      <Stack>
        <form
          onSubmit={e => {
            e.preventDefault();
            void form.handleSubmit();
          }}
        >
          <form.Field name="reason">{field => <field.TextField field={field} label="Reason" required />}</form.Field>
          <Title order={5}>This cannot be undone once confirmed</Title>
        </form>
        <Group justify="end">
          <Button onClick={onClose} leftSection={<ArrowLeftIcon />} variant="subtle">
            Cancel
          </Button>
          <form.Subscribe selector={state => state.canSubmit}>
            {canSubmit => (
              <Button
                color="red"
                type="submit"
                variant="filled"
                onClick={() => {
                  void form.handleSubmit();
                }}
                disabled={!canSubmit}
                leftSection={<TrashIcon />}
              >
                Confirm Removal
              </Button>
            )}
          </form.Subscribe>
        </Group>
      </Stack>
    </Modal>
  );
};
