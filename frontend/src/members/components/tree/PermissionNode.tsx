import { Classes } from '@blueprintjs/core';
import { PlusIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import { type ReactNode, useState } from 'react';

import { permissionsAtom } from '../../../atoms/authentication';
import { MembersData } from '../../api';
import { isAbleToModify } from '../../isAbleToModify';
import { AddPermissionDialog } from '../AddPermissionDialog';

import { LetterNode } from './LetterNode';
import { TreeNode } from './TreeNode';
import { UsernameNode } from './UsernameNode';

export interface PermissionNodeProps {
  permission: string;
  count: number;
}

export const PermissionNode = ({ permission, count }: PermissionNodeProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data, isFetching } = useQuery({
    enabled: isOpen,
    ...MembersData.fetchUsersInPermission(permission),
  });
  const [isAddingPermission, setIsAddingPermission] = useState(false);

  const userPermissions = useAtomValue(permissionsAtom);
  const canModify = isAbleToModify(userPermissions ?? [], permission);

  let content: ReactNode;

  if (data === undefined) {
    content = null;
  } else if (Array.isArray(data)) {
    content = data.map(username => (
      <UsernameNode key={username} username={username} permission={permission} depth={1} />
    ));
  } else {
    content = Object.entries(data).map(([letter, count]) => (
      <LetterNode key={letter} permission={permission} letter={letter} count={count} depth={1} />
    ));
  }

  return (
    <>
      <TreeNode
        key={permission}
        label={`${permission} (${count})`}
        depth={0}
        aria-label={`Permission: ${permission}, Count: ${count}`}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        isLoading={isFetching}
        rightIcon={
          canModify && (
            <PlusIcon
              aria-label={`Add a user to role: ${permission}`}
              className={Classes.INTENT_SUCCESS}
              onClick={e => {
                e.stopPropagation();
                setIsAddingPermission(true);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.stopPropagation();
                  setIsAddingPermission(true);
                }
              }}
            />
          )
        }
      >
        {content}
      </TreeNode>
      {isAddingPermission && (
        <AddPermissionDialog
          permission={permission}
          onClose={() => {
            setIsAddingPermission(false);
          }}
        />
      )}
    </>
  );
};
