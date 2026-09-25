import { Button, Callout, H1, Intent, NonIdealState, Spinner } from '@blueprintjs/core';
import { PlusIcon, FileTextIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { Link } from 'react-router';

import { isHostingAdvisorAtom, isHostingBannedAtom, usernameAtom } from '../atoms/authentication';

import { HostApplicationsData } from './api';
import { canApplyToHostAtom } from './atoms';
import { ExistingHostApplication } from './components/ExistingHostApplication';

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
    <div>
      <title>uhc.gg | Host Applications</title>
      <H1>Host Applications</H1>

      {error && <Callout intent={Intent.DANGER}>{error.message}</Callout>}

      {isBanned && (
        <Callout intent={Intent.DANGER} style={{ marginBottom: 20 }}>
          You are banned from hosting and cannot submit an application.
        </Callout>
      )}

      {canApply && (
        <div style={{ marginBottom: 20 }}>
          <Link to="/host-applications/apply">
            <Button intent={Intent.PRIMARY} icon={<PlusIcon />}>
              Apply to host
            </Button>
          </Link>
        </div>
      )}

      {isFetching ? (
        <Spinner />
      ) : data?.length === 0 ? (
        <NonIdealState
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
    </div>
  );
};
