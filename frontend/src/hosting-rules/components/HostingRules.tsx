import { Collapse, Button, Group, Title, Card, Alert } from '@mantine/core';
import { CaretDownIcon, CaretRightIcon, WarningIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';

import { WithPermission } from '@/authentication/components/WithPermission';
import { Markdown } from '@/components/Markdown';
import { HostingRulesData } from '@/hosting-rules/api';
import styles from '@/hosting-rules/components/HostingRules.module.css';
import { SetRulesDialog } from '@/hosting-rules/components/SetRulesDialog';

export const HostingRules: React.FC = () => {
  const [areRulesOpen, setAreRulesOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { data, error } = useQuery({
    enabled: areRulesOpen,
    ...HostingRulesData.fetchHostingRules,
  });

  const lastModified = () => {
    if (!data) {
      return null;
    }

    const time = data.modified.format('MMM Do HH:mm z');
    return `Last modified: ${time} by /u/${data.author}`;
  };

  return (
    <Card p={0} shadow="sm" withBorder>
      <Group
        p="sm"
        role="button"
        onClick={() => {
          setAreRulesOpen(prev => !prev);
        }}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            setAreRulesOpen(prev => !prev);
          }
        }}
        className={styles.trigger}
      >
        {areRulesOpen ? <CaretDownIcon /> : <CaretRightIcon />}
        <Title order={3} flex={1}>
          Hosting Rules
        </Title>
        <span className="hosting-rules_last-modified">{lastModified()}</span>
      </Group>
      <Collapse expanded={areRulesOpen} p="lg" pt={0}>
        {!!error && <Alert variant="light" color="red" title={error.message} icon={<WarningIcon />} />}
        {!!data && <Markdown markdown={data.content} />}
        <WithPermission permission="hosting advisor">
          <Group justify="end" mt="sm">
            <Button
              size="compact-sm"
              variant="primary"
              onClick={() => {
                setIsEditing(true);
              }}
            >
              Edit Rules
            </Button>
          </Group>
          {isEditing && (
            <SetRulesDialog
              current={data?.content ?? ''}
              onClose={() => {
                setIsEditing(false);
              }}
            />
          )}
        </WithPermission>
      </Collapse>
    </Card>
  );
};
