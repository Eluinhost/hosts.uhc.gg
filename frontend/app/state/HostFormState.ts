import { Action, createAction } from 'redux-actions';
import { ThunkAction } from 'redux-thunk';
import { ApplicationState } from './ApplicationState';
import { getPotentialConflicts } from '../api/index';
import { ReducerBuilder } from './ReducerBuilder';
import { T, F, always } from 'ramda';
import { Match } from '../Match';
import * as moment from 'moment';

export type HostFormConflicts = {
  readonly data: Match[];
  readonly error: string | null;
  readonly fetching: boolean;
};

export type HostFormState = {
  readonly conflicts: HostFormConflicts;
};

const startConflictsFetch = createAction('GET_CONFLICTS_START_FETCH');
const endConflictsFetch = createAction<Match[]>('GET_CONFLICTS_END_FETCH');
const conflictsFetchError = createAction<string>('GET_CONFLICTS_FETCH_ERROR');

export const HostFormActions = {
  getConflicts: (region: string, opens: moment.Moment): ThunkAction<Promise<Match[]>, ApplicationState, {}> =>
    async (dispatch): Promise<Match[]> => {
      dispatch(startConflictsFetch());

      try {
        const matches = await getPotentialConflicts(region, opens);

        dispatch(endConflictsFetch(matches));
        return matches;
      } catch (err) {
        dispatch(conflictsFetchError('Unexpected response from the server'));

        throw err;
      }
    },
};

export const reducer = new ReducerBuilder<HostFormState>()
  .handleEvolve(startConflictsFetch, {
    conflicts: {
      fetching: T,
      error: always(null),
    },
  })
  .handleEvolve(endConflictsFetch, (action: Action<Match[]>) => ({
    conflicts: {
      fetching: F,
      error: always(null),
      data: always(action.payload),
    },
  }))
  .handleEvolve(conflictsFetchError, (action: Action<string>) => ({
    conflicts: {
      fetching: F,
      error: always(action.payload),
    },
  }))
  .build();

export const initialValues = async (): Promise<HostFormState> => ({
  conflicts: {
    data: [],
    error: null,
    fetching: false,
  },
});
