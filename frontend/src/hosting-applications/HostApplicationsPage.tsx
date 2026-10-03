import { Button, Alert, Title, EmptyState, Loader, Stack, Group } from '@mantine/core';
import { PlusIcon, FileTextIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';

import {
  isHostAtom,
  isHostingAdvisorAtom,
  isHostingBannedAtom,
  isTrialHostAtom,
  usernameAtom,
} from '@/authentication/atoms/authentication';
import { HostApplicationsData } from '@/hosting-applications/api';
import { ExistingHostApplication } from '@/hosting-applications/components/ExistingHostApplication';
import { LoginButton } from '@/shell/components/LoginButton';

export const HostApplicationsPage = () => {
  const username = useAtomValue(usernameAtom);
  const isBanned = useAtomValue(isHostingBannedAtom);
  const isHost = useAtomValue(isHostAtom);
  const isTrialHost = useAtomValue(isTrialHostAtom);
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

  const renderApplyButton = () => {
    if (!username) {
      return (
        <Group mb={20}>
          <LoginButton label="Login to apply to host" />
        </Group>
      );
    }

    if (isHost || isTrialHost) {
      return null;
    }

    return (
      <Group mb={20}>
        <Link to="/host-applications/apply">
          <Button color="green" leftSection={<PlusIcon />}>
            Apply to host
          </Button>
        </Link>
      </Group>
    );
  };

  return (
    <Stack justify="center">
      <title>uhc.gg | Host Applications</title>
      <Title order={1} ta="center" mb="lg">
        Host Applications
      </Title>

      {error && <Alert color="red">{error.message}</Alert>}

      {isBanned && (
        <Alert color="red" mb={20}>
          You are banned from hosting and cannot submit an application.
        </Alert>
      )}

      {renderApplyButton()}

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
