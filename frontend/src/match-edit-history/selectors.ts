import { createSelector, Selector } from 'reselect';
import { identity } from 'ramda';

import { ApplicationState } from '../state/ApplicationState';
import { MatchEditHistoryState } from './reducers';
import { Match } from '../models/Match';

export const getBaseMatchEditHistoryState: Selector<ApplicationState, MatchEditHistoryState> = createSelector(
  state => state.matchEditHistory,
  identity,
);

export const getMatchEditHistory: Selector<ApplicationState, Match[]> = createSelector(
  getBaseMatchEditHistoryState,
  state => state.data,
);

export const getIsFetching: Selector<ApplicationState, boolean> = createSelector(
  getBaseMatchEditHistoryState,
  state => state.isFetching,
);

export const getError: Selector<ApplicationState, any | null> = createSelector(
  getBaseMatchEditHistoryState,
  state => state.error,
);
