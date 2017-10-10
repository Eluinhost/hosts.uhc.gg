import { ApplicationReducer, ReducerBuilder } from './ReducerBuilder';
import { Match } from '../models/Match';
import { HostFormConflicts } from '../actions';

export type HostFormConflictsState = {
  readonly conflicts: Match[];
  readonly error: string | null;
  readonly fetching: boolean;
};

export const reducer: ApplicationReducer<HostFormConflictsState> = ReducerBuilder
  .withInitialState<HostFormConflictsState>({
    conflicts: [],
    fetching: false,
    error: null,
  })
  .handle(HostFormConflicts.started, (prev, action) => ({
    conflicts: [],
    fetching: true,
    error: null,
  }))
  .handle(HostFormConflicts.success, (prev, action) => ({
    conflicts: action.payload!.result,
    fetching: false,
    error: null,
  }))
  .handle(HostFormConflicts.failure, (prev, action) => ({
    conflicts: [],
    fetching: false,
    error: 'Unable to fetch conflicts',
  }))
  .build();
