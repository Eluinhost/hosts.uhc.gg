import { Group } from '@mantine/core';

import { ModerationLog } from '@/members/components/ModerationLog';
import { MembersTree } from '@/members/components/tree/MembersTree';

export const MembersPage = () => {
  return (
    <Group justify="start" align="start" gap="xl">
      <title>uhc.gg | Members</title>

      <MembersTree />
      <ModerationLog />
    </Group>
  );
};
