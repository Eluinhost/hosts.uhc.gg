import { Button, Group, Paper } from '@mantine/core';
import { CodeIcon, ChatCircleDotsIcon, GitBranchIcon, BugIcon } from '@phosphor-icons/react';
import React from 'react';

import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  return (
    <Paper bdrs={0} className={styles.footer} mt="lg" component="footer" p="xs">
      <Group justify="space-between" align="center">
        <Button
          href="https://uhc.gg/discord"
          leftSection={<ChatCircleDotsIcon />}
          variant="subtle"
          target="_blank"
          rel="noopener noreferrer"
          component="a"
        >
          Discord
        </Button>
        <Group>
          <Button
            href="https://github.com/Eluinhost/hosts.uhc.gg"
            leftSection={<GitBranchIcon />}
            variant="subtle"
            target="_blank"
            component="a"
          >
            Source
          </Button>
          <Button
            href="https://github.com/Eluinhost/hosts.uhc.gg/issues"
            leftSection={<BugIcon />}
            variant="subtle"
            target="_blank"
            component="a"
          >
            Issues
          </Button>
          <Button href="/api/docs/" variant="subtle" leftSection={<CodeIcon />} target="_blank" component="a">
            API
          </Button>
        </Group>
      </Group>
    </Paper>
  );
};
