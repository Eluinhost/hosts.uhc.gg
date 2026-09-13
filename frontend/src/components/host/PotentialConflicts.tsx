import React from 'react';
import { NonIdealState, Spinner } from '@blueprintjs/core';
import { useSelector } from 'react-redux';

import { MatchRow } from '../match-row';

export const PotentialConflicts = React.memo(() => {
  const { fetching, error, conflicts } = useSelector(state => state.hostFormConflicts);

  if (fetching) return <NonIdealState icon={<Spinner />} title="Checking..." />;

  if (error) return <NonIdealState icon="warning-sign" title="Failed to check for potential conflicts" />;

  if (!conflicts.length) return <NonIdealState icon="tick" title="No conflicts found" />;

  return (
    <div>
      {conflicts.map((m, index) => (
        <MatchRow key={index} match={m} disableApproval disableRemoval disableLink />
      ))}
    </div>
  );
});
