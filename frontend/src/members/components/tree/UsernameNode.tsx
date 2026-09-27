import { ActionIcon } from '@mantine/core';
import { TrashIcon, UserIcon } from '@phosphor-icons/react';
import { useAtomValue } from 'jotai';
import { useState } from 'react';

import { permissionsAtom } from '../../../atoms/authentication';
import { isAbleToModify } from '../../isAbleToModify';
import { RemovePermissionDialog } from '../RemovePermissionDialog';

import { TreeNode } from './TreeNode';

export interface UsernameNodeProps {
  username: string;
  permission: string;
}

export const UsernameNode = ({ username, permission }: UsernameNodeProps) => {
  const [isRemoving, setIsRemoving] = useState(false);

  const userPermissions = useAtomValue(permissionsAtom);
  const canModify = isAbleToModify(userPermissions ?? [], permission);

  return (
    <>
      <TreeNode
        label={username}
        icon={<UserIcon />}
        aria-label={`User: ${username}, click to remove permission '${permission}'`}
        rightIcon={
          canModify && (
            <ActionIcon
              color="red"
              size="sm"
              bdrs={100}
              variant="filled"
              aria-label={`Remove user: ${username} from role: ${permission}`}
              onClick={e => {
                e.stopPropagation();
                setIsRemoving(true);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.stopPropagation();
                  setIsRemoving(true);
                }
              }}
            >
              <TrashIcon size={14} />
            </ActionIcon>
          )
        }
        isOpen
      />
      {isRemoving && (
        <RemovePermissionDialog
          permission={permission}
          username={username}
          onClose={() => {
            setIsRemoving(false);
          }}
        />
      )}
    </>
  );
};
