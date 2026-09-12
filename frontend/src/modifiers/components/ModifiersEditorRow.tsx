import React, { useCallback, useState } from 'react';
import { Classes, Icon, IconName, Intent, MaybeElement, Tag } from '@blueprintjs/core';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector, ParametricSelector } from 'reselect';

import { Modifier } from '../Modifier';
import { ApplicationState } from '../../state/ApplicationState';
import { getDeleteModifersState } from '../selectors';
import { DELETE_MODIFIER } from '../actions';

export type ModifiersEditorRowProps = {
  modifier: Modifier;
};

const mapStateToProps: ParametricSelector<
  ApplicationState,
  ModifiersEditorRowProps,
  { isDeleting: boolean; hasDeleteError: boolean }
> = createSelector(
  getDeleteModifersState,
  (state: ApplicationState, props: ModifiersEditorRowProps) => props.modifier.id,
  (state, id) => ({
    isDeleting: state.arguments === id,
    hasDeleteError: !!state.error,
  }),
);

export const ModifierEditorRow: React.FC<ModifiersEditorRowProps> = React.memo((props: ModifiersEditorRowProps) => {
  const { modifier } = props;
  const { isDeleting } = useSelector(state => mapStateToProps(state, { modifier }));
  const dispatch = useDispatch();

  const [isHovered, setIsHovered] = useState(false);

  const onMouseEnter = useCallback(() => setIsHovered(true), []);
  const onMouseLeave = useCallback(() => setIsHovered(false), []);

  const onDelete = useCallback(() => dispatch(DELETE_MODIFIER.TRIGGER(modifier.id)), [dispatch, modifier.id]);

  let icon: IconName | MaybeElement = undefined;

  if (isDeleting) {
    icon = <Icon icon="refresh" className={Classes.SPINNER_ANIMATION} />;
  } else if (isHovered) {
    icon = 'trash';
  }

  return (
    <span onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} className="modifiers-editor_entry">
      <span>-</span>
      <Tag
        interactive
        title="Delete modifier"
        onClick={onDelete}
        large
        rightIcon={icon}
        intent={isHovered ? Intent.DANGER : Intent.NONE}
        className="modifiers-editor_entry_tag"
      >
        {modifier.displayName}
      </Tag>
    </span>
  );
});
