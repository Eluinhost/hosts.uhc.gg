import { Button, Group, Modal, Stack, Title } from '@mantine/core';
import { ArrowLeftIcon, CheckIcon } from '@phosphor-icons/react';
import React from 'react';

import { MatchesData } from '@/matches/api';

export interface ApprovalModalProps {
  id: number;
  onClose: () => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({ id, onClose }) => {
  const { mutateAsync, isPending } = MatchesData.mutations.useApproveMatch();

  const handleClick = async () => {
    await mutateAsync(id);
    onClose();
  };

  return (
    <Modal opened onClose={onClose} title="Approve match" centered>
      <Stack align="center">
        <Title order={5}>Are you sure you want to approve this match?</Title>
        <Group justify="end">
          <Button onClick={onClose} leftSection={<ArrowLeftIcon />} variant="subtle">
            Cancel
          </Button>
          <Button
            loading={isPending}
            color="green"
            onClick={() => {
              void handleClick();
            }}
            leftSection={<CheckIcon />}
          >
            Confirm Approval
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
