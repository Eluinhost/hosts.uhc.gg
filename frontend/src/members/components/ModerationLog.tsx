import { Alert, Button, EmptyState, Group, Loader, Stack, Title } from '@mantine/core';
import { PlusIcon, ArrowClockwiseIcon, MinusIcon, WarningIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import React, { type ReactNode } from 'react';

import type { PermissionModerationLogEntry } from '../../models/PermissionModerationLogEntry';
import { MatchOpens } from '../../time/components/MatchOpens';
import { MembersData } from '../api';

const renderRow = (row: PermissionModerationLogEntry) => (
  <Alert
    key={row.id}
    color={row.added ? 'green' : 'red'}
    title={`${row.permission} /u/${row.username}`}
    icon={row.added ? <PlusIcon /> : <MinusIcon />}
  >
    Actioned by {row.modifier} @ <MatchOpens time={row.at} />
  </Alert>
);

export const ModerationLog: React.FC = () => {
  const { data, isFetching, error, refetch } = useQuery(MembersData.fetchPermissionModerationLog);

  let content: ReactNode;

  if (isFetching) {
    content = <EmptyState icon={<Loader />} title="Loading..." />;
  } else {
    content = (
      <>
        {data?.map(renderRow)}
        {!!error && <Alert icon={<WarningIcon />} title={error.message} />}
      </>
    );
  }

  return (
    <Stack flex={1}>
      <Title order={2}>Moderation Log</Title>
      {content}
      <Group justify="end">
        <Button
          disabled={isFetching}
          onClick={() => void refetch()}
          leftSection={<ArrowClockwiseIcon />}
          variant="filled"
          color="green"
        >
          Refresh
        </Button>
      </Group>
    </Stack>
  );
};
