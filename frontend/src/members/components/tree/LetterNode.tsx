import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { MembersData } from '../../api';

import { TreeNode } from './TreeNode';
import { UsernameNode } from './UsernameNode';

export interface LetterNodeProps {
  permission: string;
  letter: string;
  count: number;
  depth: number;
}

export const LetterNode = ({ permission, letter, count, depth }: LetterNodeProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data, isFetching } = useQuery({
    enabled: isOpen,
    ...MembersData.fetchUsersInPermissionLetter(permission, letter),
  });

  return (
    <TreeNode
      label={`${letter} (${count})`}
      depth={depth}
      aria-label={`Permission: ${permission}, users beginning with ${letter} count: ${count}`}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      isLoading={isFetching}
    >
      {(data ?? []).map(username => (
        <UsernameNode key={username} username={username} permission={permission} depth={depth + 1} />
      ))}
    </TreeNode>
  );
};
