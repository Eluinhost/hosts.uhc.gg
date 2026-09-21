import { Button, Classes, Dialog, H5, Intent } from '@blueprintjs/core';
import { ArrowLeftIcon, RemoveIcon } from '@blueprintjs/icons';
import { clsx } from 'clsx';
import { useSelector } from 'react-redux';

import { isDarkMode } from '../../state/Selectors';
import { MembersData } from '../api';

export interface RemovePermissionDialogProps {
  permission: string;
  username: string;
  onClose: () => void;
}

export const RemovePermissionDialog = ({ permission, username, onClose }: RemovePermissionDialogProps) => {
  const darkMode = useSelector(isDarkMode);
  const { mutate, isPending } = MembersData.mutations.useRemovePermission();

  return (
    <Dialog
      icon={<RemoveIcon />}
      isOpen
      onClose={onClose}
      title="Remove role"
      className={clsx({ [Classes.DARK]: darkMode })}
    >
      <div className={clsx(Classes.DIALOG_BODY, 'remove-permission-body')}>
        <H5>
          Are you sure you want to remove &#39;{permission}&#39; from /u/{username}?
        </H5>
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button onClick={onClose} icon={<ArrowLeftIcon />}>
            Cancel
          </Button>
          <Button
            intent={Intent.DANGER}
            onClick={() => {
              mutate({ permission, username });
            }}
            icon={<RemoveIcon />}
            disabled={isPending}
          >
            Remove permission
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
