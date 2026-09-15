import { Button, Intent, NonIdealState, Spinner, Switch } from '@blueprintjs/core';
import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { FETCH_MODIFIERS } from '../actions';
import { getListModifiersState } from '../selectors';

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
  const { isFetching, error, data } = useSelector(getListModifiersState);
  const dispatch = useDispatch();

  const updateModifiers = useCallback(() => dispatch(FETCH_MODIFIERS.TRIGGER()), [dispatch]);

  useEffect(() => {
    updateModifiers();
  }, [updateModifiers]);

  if (isFetching) {
    return <Spinner />;
  }

  if (error) {
    return (
      <NonIdealState
        icon="warning-sign"
        title="Failed to lookup modifiers"
        action={
          <Button intent={Intent.PRIMARY} onClick={updateModifiers}>
            Try Again
          </Button>
        }
      />
    );
  }

  return (
    <div>
      {data.map(modifier => (
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
