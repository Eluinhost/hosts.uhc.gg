import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Button, Classes, Intent, NonIdealState, Spinner } from '@blueprintjs/core';

import { ModifiersState } from '../reducer';
import { getModifiersState } from '../selectors';
import { DELETE_MODIFIER, FETCH_MODIFIERS } from '../actions';
import { ModifierEditorRow } from './ModifiersEditorRow';

import './ModifiersEditor.scss';
import { CreateModifierForm } from './CreateModifierForm';

type StateProps = ModifiersState;

type DispatchProps = {
  updateModifers: () => void;
  deleteModifier: (id: number) => void;
};

class ModifiersEditorComponent extends React.PureComponent<StateProps & DispatchProps> {
  componentDidMount(): void {
    this.updateModifiers();
  }

  updateModifiers = (): void => this.props.updateModifers();

  render() {
    if (this.props.list.isFetching) {
      return <Spinner />;
    }

    if (this.props.list.error) {
      return (
        <NonIdealState
          icon="warning-sign"
          title="Failed to lookup modifiers"
          action={
            <Button intent={Intent.PRIMARY} onClick={this.updateModifiers}>
              Try Again
            </Button>
          }
        />
      );
    }

    return (
      <div>
        <ul className={`${Classes.LIST_UNSTYLED} modifiers-editor_list`}>
          {this.props.list.data.map(modifier => (
            <li key={modifier.id}>
              <ModifierEditorRow modifier={modifier} />
            </li>
          ))}
        </ul>
        <CreateModifierForm />
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
  updateModifers: () => dispatch(FETCH_MODIFIERS.TRIGGER()),
  deleteModifier: (id: number) => dispatch(DELETE_MODIFIER.TRIGGER(id)),
});

export const ModifiersEditor: React.ComponentType = connect(
  getModifiersState,
  mapDispatchToProps,
)(ModifiersEditorComponent);
