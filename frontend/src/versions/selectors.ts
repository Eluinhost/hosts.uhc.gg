import { createSelector, Selector } from 'reselect';
import { identity } from 'ramda';

import { ApplicationState } from '../state/ApplicationState';
import { ListVersionsState, VersionsState } from './reducer';

export const getVersionsState: Selector<ApplicationState, VersionsState> = createSelector(
  state => state.versions,
  identity,
);

export const getListVersionsState: Selector<ApplicationState, ListVersionsState> = createSelector(
  getVersionsState,
  versions => versions.list,
);

export const getAllVersionNames: Selector<ApplicationState, string[]> = createSelector(getListVersionsState, state =>
  state.data.map(version => version.displayName),
);
