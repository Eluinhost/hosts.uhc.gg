import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { MembersData } from '@/members/api';
import { TreeNode } from '@/members/components/tree/TreeNode';
import { UsernameNode } from '@/members/components/tree/UsernameNode';

export interface LetterNodeProps {
  permission: string;
  letter: string;
  count: number;
}

export const LetterNode = ({ permission, letter, count }: LetterNodeProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data, isFetching } = useQuery({
    enabled: isOpen,
    ...MembersData.fetchUsersInPermissionLetter(permission, letter),
  });

  return (
    <TreeNode
      label={`${letter} (${count})`}
      aria-label={`Permission: ${permission}, users beginning with ${letter} count: ${count}`}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      isLoading={isFetching}
    >
      {(data ?? []).map(username => (
        <UsernameNode key={username} username={username} permission={permission} />
      ))}
    </TreeNode>
  );
};
