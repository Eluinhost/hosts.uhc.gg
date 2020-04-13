import * as React from 'react';
import { connect } from 'react-redux';
import { createSelector, Selector } from 'reselect';
import { Button, Callout, Classes, ControlGroup, FormGroup, InputGroup, Intent } from '@blueprintjs/core';
import { Dispatch } from 'redux';

import { ApplicationState } from '../../state/ApplicationState';
import { getAllModifierNames, getCreateModifiersState } from '../selectors';
import { CREATE_MODIFIER } from '../actions';
import { CreateModifierState } from '../reducer';

type StateProps = CreateModifierState & {
  taken: string[];
};

type DispatchProps = {
  createModifier: (name: string) => void;
};

class CreateModifierFormComponent extends React.PureComponent<StateProps & DispatchProps> {
  state = {
    modifier: '',
  };

  handleSubmit = (event: React.FormEvent): void => {
    event.preventDefault();

    this.props.createModifier(this.state.modifier);
  };

  handleChange = (event: React.ChangeEvent<HTMLInputElement>): void =>
    this.setState({
      modifier: event.target.value,
    });

  render() {
    const alreadyExists = this.props.taken.includes(this.state.modifier.toLowerCase());
    const valid = !alreadyExists && this.state.modifier.length > 0;

    return (
      <form onSubmit={this.handleSubmit}>
        <FormGroup label="Create new modifier:">
          <ControlGroup>
            <InputGroup
              large
              type="string"
              value={this.state.modifier}
              onChange={this.handleChange}
              disabled={this.props.isFetching}
              required
            />
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
          {this.props.error && <Callout intent={Intent.DANGER}>Failed to create new modifier</Callout>}
        </FormGroup>
      </form>
    );
  }
}

const mapStateToProps: Selector<ApplicationState, StateProps> = createSelector(
  getCreateModifiersState,
  getAllModifierNames,
  (state, names) => ({
    ...state,
    taken: names.map(name => name.toLowerCase()),
  }),
);

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
  createModifier: name => dispatch(CREATE_MODIFIER.TRIGGER(name)),
});

export const CreateModifierForm: React.ComponentType = connect(
  mapStateToProps,
  mapDispatchToProps,
)(CreateModifierFormComponent);
