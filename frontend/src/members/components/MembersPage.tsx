import { Group } from '@mantine/core';

import { ModerationLog } from './ModerationLog';
import { MembersTree } from './tree/MembersTree';

export const MembersPage = () => {
  return (
    <Group justify="start" align="start" gap="xl">
      <title>uhc.gg | Members</title>

      <MembersTree />
      <ModerationLog />
    </Group>
  );
};
