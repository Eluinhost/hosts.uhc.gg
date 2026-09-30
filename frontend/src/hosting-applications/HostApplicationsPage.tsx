import { Button, Alert, Title, EmptyState, Loader, Stack, Group } from '@mantine/core';
import { PlusIcon, FileTextIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { Link } from 'react-router';

import { isHostingAdvisorAtom, isHostingBannedAtom, usernameAtom } from '@/authentication/atoms/authentication';
import { HostApplicationsData } from '@/hosting-applications/api';
import { canApplyToHostAtom } from '@/hosting-applications/atoms';
import { ExistingHostApplication } from '@/hosting-applications/components/ExistingHostApplication';

export const HostApplicationsPage = () => {
  const username = useAtomValue(usernameAtom);
  const canApply = useAtomValue(canApplyToHostAtom);
  const isBanned = useAtomValue(isHostingBannedAtom);
  const isHostingAdvisor = useAtomValue(isHostingAdvisorAtom);

  const { data, error, isFetching } = useQuery(HostApplicationsData.getAll);

  const sorted = useMemo(() => {
    if (!data) {
      return [];
    }

    if (!username) {
      return data;
    }

    const mine = data.filter(application => application.username === username);
    const others = data.filter(application => application.username !== username);
    return [...mine, ...others];
  }, [data, username]);

  return (
    <Stack>
      <title>uhc.gg | Host Applications</title>
      <Title order={1}>Host Applications</Title>

      {error && <Alert color="red">{error.message}</Alert>}

      {isBanned && (
        <Alert color="red" mb={20}>
          You are banned from hosting and cannot submit an application.
        </Alert>
      )}

      {canApply && (
        <Group mb={20}>
          <Link to="/host-applications/apply">
            <Button color="green" leftSection={<PlusIcon />}>
              Apply to host
            </Button>
          </Link>
        </Group>
      )}

      {isFetching ? (
        <Loader />
      ) : data?.length === 0 ? (
        <EmptyState
          icon={<FileTextIcon />}
          title="No host applications yet"
          description="There are no host applications to see yet."
        />
      ) : (
        sorted.map(application => (
          <ExistingHostApplication
            application={application}
            key={application.id}
            canReview={isHostingAdvisor}
            isOwn={application.username === username}
          />
        ))
      )}
    </Stack>
  );
};
