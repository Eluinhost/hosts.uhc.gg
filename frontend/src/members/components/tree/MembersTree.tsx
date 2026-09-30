import { List, Stack, Title } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';

import { MembersData } from '@/members/api';
import { LoadingNode } from '@/members/components/tree/LoadingNode';
import { PermissionNode } from '@/members/components/tree/PermissionNode';

export const MembersTree = () => {
  const { data, isFetching } = useQuery(MembersData.fetchUserCountPerPermission);

  return (
    <Stack flex={1}>
      <Title order={2}>All members</Title>
      <List pl={0} pr="xl">
        {isFetching || !data ? (
          <Stack>
            <LoadingNode />
            <LoadingNode />
            <LoadingNode />
          </Stack>
        ) : (
          Object.entries(data).map(([permission, count]) => (
            <PermissionNode key={permission} permission={permission} count={count} />
          ))
        )}
      </List>
    </Stack>
  );
};
