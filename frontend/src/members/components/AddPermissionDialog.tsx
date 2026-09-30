import { Button, Group, Modal } from '@mantine/core';
import { PlusIcon, ArrowLeftIcon } from '@phosphor-icons/react';
import * as v from 'valibot';

import { useAppForm } from '../../forms/useAppForm';
import { MembersData } from '../api';

const schema = v.object({
  username: v.pipe(v.string(), v.minLength(1, 'This field is required')),
});

export interface AddPermissionDialogProps {
  permission: string;
  onClose: () => void;
}

export const AddPermissionDialog = ({ permission, onClose }: AddPermissionDialogProps) => {
  const { mutateAsync } = MembersData.mutations.useAddPermission();

  const form = useAppForm({
    defaultValues: {
      username: '',
    },
    validators: [
      {
        run: schema,
        triggers: ['change'],
      },
    ],
    onSubmit: async state => {
      await mutateAsync({
        permission: permission,
        username: state.value.username,
      });
      onClose();
    },
  });

  return (
    <Modal opened onClose={onClose} title={`Add '${permission}' role`}>
      <form
        onSubmit={e => {
          e.preventDefault();
          void form.handleSubmit();
        }}
      >
        <form.Field name="username">{field => <field.TextField field={field} w="100%" label="Username" />}</form.Field>
        <Group justify="flex-end" mt="md">
          <Button variant="outline" onClick={onClose} leftSection={<ArrowLeftIcon />}>
            Cancel
          </Button>
          <form.Subscribe selector={state => state.canSubmit}>
            {canSubmit => (
              <Button
                variant="filled"
                color="green"
                type="submit"
                onClick={() => {
                  void form.handleSubmit();
                }}
                disabled={!canSubmit}
                leftSection={<PlusIcon />}
              >
                Add Permission
              </Button>
            )}
          </form.Subscribe>
        </Group>
      </form>
    </Modal>
  );
};
