import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Button, Intent, NonIdealState, Spinner, Switch } from '@blueprintjs/core';

import { ListModifiersState } from '../reducer';
import { getListModifiersState } from '../selectors';
import { FETCH_MODIFIERS } from '../actions';

export type ModifiersSelectorProps = {
  onAdded: (selected: string) => void;
  onRemoved: (selected: string) => void;
  selected: string[];
};

type StateProps = ListModifiersState;

type DispatchProps = {
  updateModifiers: () => void;
};

class ModifierSwitch extends React.PureComponent<
  ModifiersSelectorProps & { displayName: string; isSelected: boolean }
> {
  onChange = () => {
    if (this.props.isSelected) {
      this.props.onRemoved(this.props.displayName);
    } else {
      this.props.onAdded(this.props.displayName);
    }
  };

  render() {
    return (
      <Switch inline large checked={this.props.isSelected} label={this.props.displayName} onChange={this.onChange} />
    );
  }
}

class ModifiersSelectorComponent extends React.PureComponent<ModifiersSelectorProps & StateProps & DispatchProps> {
  componentDidMount(): void {
    this.updateModifiers();
  }

  updateModifiers = () => this.props.updateModifiers();

  render() {
    if (this.props.isFetching) {
      return <Spinner />;
    }

    if (this.props.error) {
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
        {this.props.data.map(modifier => (
          <ModifierSwitch
            {...this.props}
            key={modifier.id}
            isSelected={this.props.selected.includes(modifier.displayName)}
            displayName={modifier.displayName}
          />
        ))}
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
  updateModifiers: () => dispatch(FETCH_MODIFIERS.TRIGGER()),
});

export const ModifierSelector: React.ComponentType<ModifiersSelectorProps> = connect(
  getListModifiersState,
  mapDispatchToProps,
)(ModifiersSelectorComponent);
