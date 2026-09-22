import { Button, Callout, Classes, H2, H5, Intent, NonIdealState, Spinner } from '@blueprintjs/core';
import { AddIcon, RefreshIcon, RemoveIcon } from '@blueprintjs/icons';
import { useQuery } from '@tanstack/react-query';
import React from 'react';

import type { PermissionModerationLogEntry } from '../../models/PermissionModerationLogEntry';
import { MatchOpens } from '../../time/components/MatchOpens';
import { MembersData } from '../api';

const renderRow = (row: PermissionModerationLogEntry) => (
  <Callout
    key={row.id}
    className={`moderation-log-entry ${Classes.MONOSPACE_TEXT}`}
    intent={row.added ? Intent.SUCCESS : Intent.DANGER}
    title={`${row.permission} /u/${row.username}`}
    icon={row.added ? <AddIcon /> : <RemoveIcon />}
  >
    Actioned by {row.modifier} @ <MatchOpens time={row.at} />
  </Callout>
);

export const ModerationLog: React.FC = () => {
  const { data, isFetching, error, refetch } = useQuery(MembersData.fetchPermissionModerationLog);

  if (isFetching) return <NonIdealState icon={<Spinner />} title="Loading..." />;

  return (
    <div className="moderation-log">
      <H2>Moderation Log</H2>
      {data?.map(renderRow)}
      {!!error && (
        <div className={`${Classes.CALLOUT} ${Classes.INTENT_DANGER}`}>
          <H5>{error.message}</H5>
        </div>
      )}
      <Button disabled={isFetching} onClick={() => void refetch()} icon={<RefreshIcon />} intent={Intent.SUCCESS}>
        Refresh
      </Button>
    </div>
  );
};
