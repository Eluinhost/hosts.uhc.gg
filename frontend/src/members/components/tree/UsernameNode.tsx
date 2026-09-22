import { Classes } from '@blueprintjs/core';
import { TrashIcon, UserIcon } from '@blueprintjs/icons';
import { useAtomValue } from 'jotai';
import { useState } from 'react';

import { permissionsAtom } from '../../../atoms/authentication';
import { isAbleToModify } from '../../isAbleToModify';
import { RemovePermissionDialog } from '../RemovePermissionDialog';

import { TreeNode } from './TreeNode';

export interface UsernameNodeProps {
  username: string;
  permission: string;
  depth: number;
}

export const UsernameNode = ({ username, permission, depth }: UsernameNodeProps) => {
  const [isRemoving, setIsRemoving] = useState(false);

  const userPermissions = useAtomValue(permissionsAtom);
  const canModify = isAbleToModify(userPermissions ?? [], permission);

  return (
    <>
      <TreeNode
        depth={depth}
        label={username}
        icon={<UserIcon />}
        aria-label={`User: ${username}, click to remove permission '${permission}'`}
        rightIcon={
          canModify && (
            <TrashIcon
              aria-label={`Remove user: ${username} from role: ${permission}`}
              className={Classes.INTENT_DANGER}
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
            />
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
