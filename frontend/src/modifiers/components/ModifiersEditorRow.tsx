import * as React from 'react';
import { Classes, Icon, IconName, Intent, MaybeElement, Tag } from '@blueprintjs/core';
import { connect } from 'react-redux';
import { createSelector, ParametricSelector } from 'reselect';
import { Dispatch } from 'redux';

import { Modifier } from '../Modifier';
import { ApplicationState } from '../../state/ApplicationState';
import { getDeleteModifersState } from '../selectors';
import { DELETE_MODIFIER } from '../actions';

export type ModifiersEditorRowProps = {
  modifier: Modifier;
};

type StateProps = {
  isDeleting: boolean;
  hasDeleteError: boolean;
};

type DispatchProps = {
  onDelete: (modifier: Modifier) => void;
};

class ModifiersEditorRowComponent extends React.PureComponent<
  ModifiersEditorRowProps & StateProps & DispatchProps,
  { isHovered: boolean }
> {
  state = {
    isHovered: false,
  };

  onClick = () => this.props.onDelete(this.props.modifier);

  onMouseEnter = () => this.setState({ isHovered: true });
  onMouseLeave = () => this.setState({ isHovered: false });

  render() {
    let icon: IconName | MaybeElement = undefined;

    if (this.props.isDeleting) {
      icon = <Icon icon="refresh" className={Classes.SPINNER_ANIMATION} />;
    } else if (this.state.isHovered) {
      icon = 'trash';
    }

    return (
      <span onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave} className="modifiers-editor_entry">
        <span>-</span>
        <Tag
          interactive
          title="Delete modifier"
          onClick={this.onClick}
          large
          rightIcon={icon}
          intent={this.state.isHovered ? Intent.DANGER : Intent.NONE}
          className="modifiers-editor_entry_tag"
        >
          {this.props.modifier.displayName}
        </Tag>
      </span>
    );
  }
}

const mapStateToProps: ParametricSelector<ApplicationState, ModifiersEditorRowProps, StateProps> = createSelector(
  getDeleteModifersState,
  (state: ApplicationState, props: ModifiersEditorRowProps) => props.modifier.id,
  (state, id) => ({
    isDeleting: state.arguments === id,
    hasDeleteError: !!state.error,
  }),
);

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
  onDelete: modifier => dispatch(DELETE_MODIFIER.TRIGGER(modifier.id)),
});

export const ModifierEditorRow: React.ComponentType<ModifiersEditorRowProps> = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ModifiersEditorRowComponent);
