import { createSelector, Selector } from 'reselect';
import { ApplicationState } from '../state/ApplicationState';
import { ModifiersState } from './reducer';

export const getModifiersState: Selector<ApplicationState, ModifiersState> = createSelector(
  state => state.modifiers,
  modifiers => modifiers,
);
