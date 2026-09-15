import { NonIdealState, Spinner } from '@blueprintjs/core';
import { TickIcon, WarningSignIcon } from '@blueprintjs/icons';
import React from 'react';
import { useSelector } from 'react-redux';

import { MatchRow } from '../match-row';

export const PotentialConflicts: React.FC = () => {
  const { fetching, error, conflicts } = useSelector(state => state.hostFormConflicts);

  if (fetching) return <NonIdealState icon={<Spinner />} title="Checking..." />;

  if (error) return <NonIdealState icon={<WarningSignIcon />} title="Failed to check for potential conflicts" />;

  if (!conflicts.length) return <NonIdealState icon={<TickIcon />} title="No conflicts found" />;

  return (
    <div>
      {conflicts.map((m, index) => (
        <MatchRow key={index} match={m} disableApproval disableRemoval disableLink />
      ))}
    </div>
  );
};
