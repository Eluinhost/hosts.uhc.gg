import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { Button, Callout, Classes, ControlGroup, FormGroup, InputGroup, Intent } from '@blueprintjs/core';

import { getAllModifierNames, getCreateModifiersState } from '../selectors';
import { CREATE_MODIFIER } from '../actions';

const mapStateToProps = createSelector(getCreateModifiersState, getAllModifierNames, (state, names) => ({
  ...state,
  taken: names.map(name => name.toLowerCase()),
}));

export const CreateModifierForm: React.FC = () => {
  const { isFetching, error, taken } = useSelector(mapStateToProps);
  const dispatch = useDispatch();

  const [modifier, setModifier] = useState('');

  const createModifier = useCallback((name: string) => dispatch(CREATE_MODIFIER.TRIGGER(name)), [dispatch]);
  const handleSubmit = useCallback(
    (event: React.FormEvent): void => {
      event.preventDefault();

      createModifier(modifier);
    },
    [createModifier, modifier],
  );
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => setModifier(event.target.value),
    [],
  );

  const alreadyExists = taken.includes(modifier.toLowerCase());
  const valid = !alreadyExists && modifier.length > 0;

  return (
    <form onSubmit={handleSubmit}>
      <FormGroup label="Create new modifier:">
        <ControlGroup>
          <InputGroup large type="string" value={modifier} onChange={handleChange} disabled={isFetching} required />
          <Button
            intent={alreadyExists ? Intent.DANGER : valid ? Intent.SUCCESS : Intent.NONE}
            type="submit"
            icon="upload"
            large
            disabled={!valid}
          />
        </ControlGroup>
        {alreadyExists && (
          <div className={`${Classes.FORM_HELPER_TEXT} ${Classes.INTENT_DANGER}`}>This modifier already exists</div>
        )}
        {error && <Callout intent={Intent.DANGER}>Failed to create new modifier</Callout>}
      </FormGroup>
    </form>
  );
};
