import { createSelector, Selector } from 'reselect';
import { ApplicationState } from '../state/ApplicationState';
import { CreateModifierState, DeleteModifierState, ListModifiersState, ModifiersState } from './reducer';
import { identity } from 'ramda';

export const getModifiersState: Selector<ApplicationState, ModifiersState> = createSelector(
  state => state.modifiers,
  identity,
);

export const getListModifiersState: Selector<ApplicationState, ListModifiersState> = createSelector(
  getModifiersState,
  modifiers => modifiers.list,
);

export const getCreateModifiersState: Selector<ApplicationState, CreateModifierState> = createSelector(
  getModifiersState,
  modifiers => modifiers.create,
);

export const getDeleteModifersState: Selector<ApplicationState, DeleteModifierState> = createSelector(
  getModifiersState,
  modifiers => modifiers.delete,
);

export const getAllModifierNames: Selector<ApplicationState, string[]> = createSelector(getListModifiersState, state =>
  state.data.map(modifier => modifier.displayName),
);
