import { createReducer } from 'typesafe-redux-helpers';
import { Reducer } from 'redux';

import { Match } from '../models/Match';
import { HostFormConflicts } from '../actions';

export type HostFormConflictsState = {
  readonly conflicts: Match[];
  readonly error: string | null;
  readonly fetching: boolean;
};

export const reducer: Reducer<HostFormConflictsState> = createReducer<HostFormConflictsState>({
  conflicts: [],
  fetching: false,
  error: null,
})
  .handleAction(HostFormConflicts.started, () => ({
    conflicts: [],
    fetching: true,
    error: null,
  }))
  .handleAction(HostFormConflicts.success, (_, action) => ({
    conflicts: action.payload.result,
    fetching: false,
    error: null,
  }))
  .handleAction(HostFormConflicts.failure, () => ({
    conflicts: [],
    fetching: false,
    error: 'Unable to fetch conflicts',
  }));
