import { identity } from 'ramda';
import { createSelector } from 'reselect';

import type { ApplicationState } from '../state/ApplicationState';

export const getVersionsState = createSelector((state: ApplicationState) => state.versions, identity);

export const getListVersionsState = createSelector(getVersionsState, versions => versions.list);

export const getAllVersionNames = createSelector(getListVersionsState, state => state.data);
