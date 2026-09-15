import { identity } from 'ramda';
import { createSelector } from 'reselect';

import { ApplicationState } from '../state/ApplicationState';

export const getModifiersState = createSelector((state: ApplicationState) => state.modifiers, identity);

export const getListModifiersState = createSelector(getModifiersState, modifiers => modifiers.list);

export const getCreateModifiersState = createSelector(getModifiersState, modifiers => modifiers.create);

export const getDeleteModifersState = createSelector(getModifiersState, modifiers => modifiers.delete);

export const getAllModifierNames = createSelector(getListModifiersState, state =>
  state.data.map(modifier => modifier.displayName),
);
