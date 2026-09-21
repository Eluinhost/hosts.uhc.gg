import { NonIdealState, Spinner } from '@blueprintjs/core';
import { TickIcon, WarningSignIcon } from '@blueprintjs/icons';
import { queryOptions, useQuery } from '@tanstack/react-query';
import React from 'react';

import { MatchesApi } from '../../api';
import { type Dayjs } from '../../dayjs';
import { MatchRow } from '../match-row';

// TODO move into API file when ready
const MatchesData = {
  getPotentialConflicts: (region: string, time: Dayjs, version: string) =>
    queryOptions({
      queryKey: ['potentialConflicts', region, time, version],
      queryFn: () => MatchesApi.fetchPotentialConflicts(region, time, version),
    }),
};

export const PotentialConflicts: React.FC<{ region: string; time: Dayjs; version: string }> = ({
  region,
  time,
  version,
}) => {
  const { data, isFetching, error } = useQuery(MatchesData.getPotentialConflicts(region, time, version));

  if (isFetching) return <NonIdealState icon={<Spinner />} title="Checking..." />;

  if (error) return <NonIdealState icon={<WarningSignIcon />} title="Failed to check for potential conflicts" />;

  if (!data || data.length === 0) return <NonIdealState icon={<TickIcon />} title="No conflicts found" />;

  return (
    <div>
      {data.map((m, index) => (
        <MatchRow key={index} match={m} disableApproval disableRemoval disableLink />
      ))}
    </div>
  );
};
