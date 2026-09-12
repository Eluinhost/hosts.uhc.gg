import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Classes, Intent, NonIdealState, Spinner } from '@blueprintjs/core';

import { getModifiersState } from '../selectors';
import { FETCH_MODIFIERS } from '../actions';
import { ModifierEditorRow } from './ModifiersEditorRow';

import './ModifiersEditor.scss';
import { CreateModifierForm } from './CreateModifierForm';

export const ModifiersEditor: React.FC = React.memo(() => {
  const { list } = useSelector(getModifiersState);
  const dispatch = useDispatch();

  const updateModifiers = useCallback(() => dispatch(FETCH_MODIFIERS.TRIGGER()), [dispatch]);

  useEffect(() => {
    updateModifiers();
  }, [updateModifiers]);

  if (list.isFetching) {
    return <Spinner />;
  }

  if (list.error) {
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
      <ul className={`${Classes.LIST_UNSTYLED} modifiers-editor_list`}>
        {list.data.map(modifier => (
          <li key={modifier.id}>
            <ModifierEditorRow modifier={modifier} />
          </li>
        ))}
      </ul>
      <CreateModifierForm />
    </div>
  );
});
