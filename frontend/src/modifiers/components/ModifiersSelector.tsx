import { Switch, Loader, EmptyState, Button, Group, InputWrapper } from '@mantine/core';
import { WarningIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import React, { useMemo } from 'react';

import { ModifiersData } from '@/modifiers/api';

export type ModifiersSelectorProps = {
  onAdded: (selected: string) => void;
  onRemoved: (selected: string) => void;
  selected: string[];
};

export const ModifierSelector: React.FC<ModifiersSelectorProps> = ({
  selected,
  onAdded,
  onRemoved,
}: ModifiersSelectorProps) => {
  const { data, isFetching, error, refetch } = useQuery(ModifiersData.getAllModifiers);

  const lowered = useMemo(() => selected.map(x => x.toLowerCase()), [selected]);

  if (isFetching) {
    return <Loader />;
  }

  if (error) {
    return (
      <EmptyState icon={<WarningIcon />} title="Failed to lookup modifiers">
        <Button
          onClick={() => {
            void refetch();
          }}
        >
          Try Again
        </Button>
      </EmptyState>
    );
  }

  return (
    <InputWrapper label="Here are the scenarios that will not cause conflicts with surrounding matches:">
      <Group wrap="wrap">
        {(data ?? []).map(modifier => (
          <Switch
            key={modifier.id}
            size="sm"
            checked={lowered.includes(modifier.displayName.toLowerCase())}
            label={modifier.displayName}
            onChange={e => {
              // dom updates first, so inverted
              (e.currentTarget.checked ? onAdded : onRemoved)(modifier.displayName);
            }}
          />
        ))}
      </Group>
    </InputWrapper>
  );
};
