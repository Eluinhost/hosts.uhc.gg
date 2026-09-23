import { Button, Classes, Dialog, H5, Intent } from '@blueprintjs/core';
import { ArrowLeftIcon, TickIcon } from '@blueprintjs/icons';
import { clsx } from 'clsx';
import { useAtomValue } from 'jotai';
import React from 'react';

import { isDarkModeAtom } from '../../atoms/isDarkMode';
import { MatchesData } from '../api';

export interface ApprovalModalProps {
  id: number;
  onClose: () => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({ id, onClose }) => {
  const isDarkMode = useAtomValue(isDarkModeAtom);
  const { mutateAsync, isPending } = MatchesData.mutations.useApproveMatch();

  const handleClick = async () => {
    await mutateAsync(id);
    onClose();
  };

  return (
    <Dialog
      icon={<TickIcon />}
      isOpen
      onClose={onClose}
      title="Approve match"
      className={clsx({ [Classes.DARK]: isDarkMode })}
    >
      <div className={`${Classes.DIALOG_BODY} remove-modal-body`}>
        <H5>Are you sure you want to approve this match?</H5>
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button onClick={onClose} icon={<ArrowLeftIcon />} text="Cancel" />
          <Button
            disabled={isPending}
            intent={Intent.SUCCESS}
            onClick={() => {
              void handleClick();
            }}
            icon={<TickIcon />}
            text="Confirm Approval"
          />
        </div>
      </div>
    </Dialog>
  );
};
