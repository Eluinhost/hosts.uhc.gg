import { Button, Intent, NonIdealState, Spinner, Switch } from '@blueprintjs/core';
import { WarningIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import React from 'react';

import { ModifiersData } from '../api';

export type ModifiersSelectorProps = {
  onAdded: (selected: string) => void;
  onRemoved: (selected: string) => void;
  selected: string[];
};

const ModifierSwitch: React.FC<ModifiersSelectorProps & { displayName: string; isSelected: boolean }> = ({
  displayName,
  isSelected,
  onAdded,
  onRemoved,
}) => (
  <Switch
    inline
    size="large"
    checked={isSelected}
    label={displayName}
    onChange={() => {
      if (isSelected) {
        onRemoved(displayName);
      } else {
        onAdded(displayName);
      }
    }}
  />
);

export const ModifierSelector: React.FC<ModifiersSelectorProps> = (props: ModifiersSelectorProps) => {
  const { onAdded, onRemoved, selected } = props;
  const { data, isFetching, error, refetch } = useQuery(ModifiersData.getAllModifiers);

  if (isFetching) {
    return <Spinner />;
  }

  if (error) {
    return (
      <NonIdealState
        icon={<WarningIcon />}
        title="Failed to lookup modifiers"
        action={
          <Button
            intent={Intent.PRIMARY}
            onClick={() => {
              void refetch();
            }}
          >
            Try Again
          </Button>
        }
      />
    );
  }

  return (
    <div>
      {(data ?? []).map(modifier => (
        <ModifierSwitch
          onAdded={onAdded}
          onRemoved={onRemoved}
          selected={selected}
          key={modifier.id}
          isSelected={selected.includes(modifier.displayName)}
          displayName={modifier.displayName}
        />
      ))}
    </div>
  );
};
