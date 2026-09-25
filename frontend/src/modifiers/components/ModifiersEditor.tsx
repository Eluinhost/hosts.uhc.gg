import { Button, Classes, Intent, NonIdealState, Spinner } from '@blueprintjs/core';
import { WarningIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import React from 'react';

import { ModifiersData } from '../api';

import { CreateModifierForm } from './CreateModifierForm';
import { ModifierEditorRow } from './ModifiersEditorRow';

import './ModifiersEditor.sass';

export const ModifiersEditor: React.FC = () => {
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

  if (!data) {
    return null;
  }

  return (
    <div>
      <ul className={`${Classes.LIST_UNSTYLED} modifiers-editor_list`}>
        {data.map(modifier => (
          <li key={modifier.id}>
            <ModifierEditorRow modifier={modifier} />
          </li>
        ))}
      </ul>
      <CreateModifierForm existing={data.map(x => x.displayName.toLowerCase())} />
    </div>
  );
};
