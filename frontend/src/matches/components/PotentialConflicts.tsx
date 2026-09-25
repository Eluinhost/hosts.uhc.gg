import { NonIdealState, Spinner } from '@blueprintjs/core';
import { XCircleIcon, CheckIcon, WarningIcon } from '@phosphor-icons/react';
import { useDebouncedValue } from '@tanstack/react-pacer';
import { useQuery } from '@tanstack/react-query';
import React from 'react';

import { type Dayjs } from '../../dayjs';
import { MatchesData } from '../../matches/api';

import { MatchRow } from './MatchRow';

export const PotentialConflicts: React.FC<{
  region: string;
  time: Dayjs;
  version: string;
  isInvalid: boolean;
}> = props => {
  const [debounced, { state: isDebouncing }] = useDebouncedValue(props, { wait: 1000 }, state => state.isPending);

  const { data, isFetching, error } = useQuery({
    enabled: !debounced.isInvalid,
    ...MatchesData.getPotentialConflicts(debounced.region, debounced.time, debounced.version),
  });

  if (props.isInvalid)
    return (
      <NonIdealState
        icon={<XCircleIcon />}
        title="Cannot search for conflicts until opens/region/version fields are valid"
      />
    );

  if (isFetching || isDebouncing) return <NonIdealState icon={<Spinner />} title="Checking..." />;

  if (error) return <NonIdealState icon={<WarningIcon />} title="Failed to check for potential conflicts" />;

  if (!data || data.length === 0) return <NonIdealState icon={<CheckIcon />} title="No conflicts found" />;

  return (
    <div>
      {data.map((m, index) => (
        <MatchRow key={index} match={m} disableApproval disableRemoval disableLink />
      ))}
    </div>
  );
};
