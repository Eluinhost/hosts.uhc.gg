import { ActionIcon } from '@mantine/core';
import { PlusIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import { type ReactNode, useState } from 'react';

import { permissionsAtom } from '../../../authentication/atoms/authentication';
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
    content = data.map(username => <UsernameNode key={username} username={username} permission={permission} />);
  } else {
    content = Object.entries(data).map(([letter, count]) => (
      <LetterNode key={letter} permission={permission} letter={letter} count={count} />
    ));
  }

  return (
    <>
      <TreeNode
        key={permission}
        label={`${permission} (${count})`}
        aria-label={`Permission: ${permission}, Count: ${count}`}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        isLoading={isFetching}
        rightIcon={
          canModify && (
            <ActionIcon
              size="sm"
              variant="filled"
              color="green"
              bdrs={100}
              onClick={e => {
                e.stopPropagation();
                setIsAddingPermission(true);
              }}

              aria-label={`Add a user to role: ${permission}`}
            >
              <PlusIcon size={14} />
            </ActionIcon>
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
