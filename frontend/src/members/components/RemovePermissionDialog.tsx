import { Button, Group, Modal, Title } from '@mantine/core';
import { ArrowLeftIcon, MinusIcon } from '@phosphor-icons/react';

import { MembersData } from '../api';

export interface RemovePermissionDialogProps {
  permission: string;
  username: string;
  onClose: () => void;
}

export const RemovePermissionDialog = ({ permission, username, onClose }: RemovePermissionDialogProps) => {
  const { mutate, isPending } = MembersData.mutations.useRemovePermission();

  return (
    <Modal opened onClose={onClose} title="Remove role" centered>
      <Title order={5}>
        Are you sure you want to remove &#39;{permission}&#39; from /u/{username}?
      </Title>
      <Group justify="flex-end" mt="md">
        <Button onClick={onClose} leftSection={<ArrowLeftIcon />} variant="outline">
          Cancel
        </Button>
        <Button
          onClick={() => {
            mutate({ permission, username });
          }}
          leftSection={<MinusIcon />}
          disabled={isPending}
          color="red"
          variant="filled"
        >
          Remove permission
        </Button>
      </Group>
    </Modal>
  );
};
