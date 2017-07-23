import { Action, createAction } from 'redux-actions';
import { ReducerBuilder } from './ReducerBuilder';
import { Match } from '../Match';
import { ThunkAction } from 'redux-thunk';
import { ApplicationState } from './ApplicationState';
import {
  fetchUpcomingMatches,
  ForbiddenError,
  NotAuthenticatedError,
  removeMatch,
  UnexpectedResponseError,
} from '../api/index';
import { always, T, F, evolve, propEq, map, when } from 'ramda';
import { Reducer } from 'redux';
import { AuthenticationActions } from './AuthenticationState';

export type MatchRemovalModelState = {
  readonly isModalOpen: boolean;
  readonly targettedId: number | null;
};

export type MatchesState = {
  readonly matches: Match[];
  readonly fetching: boolean;
  readonly error: string | null;
  readonly removal: MatchRemovalModelState;
};

const startFetch = createAction('MATCHES_START_FETCH');
const endFetch = createAction<Match[]>('MATCHES_END_FETCH');
const fetchError = createAction<string>('MATCHES_FETCH_ERROR');

type StartRemovalPayload = {
  id: number;
  reason: string;
  user: string;
};
const startRemoval = createAction<StartRemovalPayload>('MATCHES_START_REMOVAL');
const endRemoval = createAction('MATCHES_END_REMOVAL');
const removalError = createAction<number>('MATCHES_REMOVAL_ERROR');

const setRemovalTarget = createAction<number>('MATCHES_SET_REMOVAL_TARGET');
const openModal = createAction('MATCHES_OPEN_MODAL');

export const MatchesActions = {
  /**
   * Refetches match list
   */
  refetch(): ThunkAction<Promise<any>, ApplicationState, {}> {
    return (dispatch) => {
      dispatch(startFetch());

      return fetchUpcomingMatches()
        .then(data => dispatch(endFetch(data)))
        .catch((err) => {
          if (err instanceof NotAuthenticatedError)
            return dispatch(fetchError('You are not logged in'));

          if (err instanceof ForbiddenError)
            return dispatch(fetchError('You do not have permissions to do this'));

          if (err instanceof UnexpectedResponseError)
            return dispatch(fetchError('Uexpected response from the server'));

          return dispatch(fetchError('Unable to fetch list from server'));
        });
    };
  },
  /**
   * Shows modal for confirmation
   */
  askForReason(id: number): ThunkAction<void, ApplicationState, {}> {
    return (dispatch) => {
      dispatch(setRemovalTarget(id));
      dispatch(openModal());
    };
  },
  /**
   * Sends actual deletion request
   */
  confirmRemove(reason: string): ThunkAction<Promise<any>, ApplicationState, {}> {
    return (dispatch, getState) => {
      const state = getState();

      const id = state.matches.removal.targettedId!;

      dispatch(startRemoval({ id, reason, user: state.authentication.data!.accessTokenClaims.username }));

      return removeMatch(id, reason, state.authentication.data!.rawAccessToken)
        .then(data => dispatch(endRemoval()))
        .catch((err) => {
          dispatch(removalError(id));

          if (err instanceof NotAuthenticatedError || err instanceof ForbiddenError) {
            dispatch(AuthenticationActions.logout());
          }

          return Promise.reject(err);
        });
    };
  },
  /**
   * Simply closes the removal modal, a 'cancel' action
   */
  closeModal: createAction('MATCHES_CLOSE_MODAL'),
  updateReason: createAction<string>('MATCHES_UPDATE_REASON'),
};

export const reducer: Reducer<MatchesState> =
  new ReducerBuilder<MatchesState>()
    .handleEvolve(startFetch, {
      fetching: T,
      error: always(null),
    })
    .handleEvolve(endFetch, (action: Action<Match[]>) => ({
      fetching: F,
      matches: always(action.payload),
      error: always(null),
    }))
    .handleEvolve(fetchError, (action: Action<string>) => ({
      fetching: F,
      error: always(action.payload),
    }))
    .handleEvolve(setRemovalTarget, (action: Action<number>) => ({
      removal: {
        targettedId: always(action.payload),
      },
    }))
    .handleEvolve(openModal, {
      removal: {
        isModalOpen: T,
      },
    })
    .handleEvolve(MatchesActions.closeModal, {
      removal: {
        isModalOpen: F,
      },
    })
    .handleEvolve(startRemoval, (action: Action<StartRemovalPayload>) => ({
      matches: map(
        when(
          propEq('id', action.payload!.id),
          evolve({
            removed: T,
            removedBy: always(action.payload!.user),
            removedReason: always(action.payload!.reason),
          }),
        ),
      ),
    }))
    .handleEvolve(removalError, (action: Action<number>) => ({
      matches: map(
        when(
          propEq('id', action.payload!),
          evolve({
            removed: F,
            removedBy: always(null),
            removedReason: always(null),
          }),
        ),
      ),
    }))
    .build();

export async function initialValues(): Promise<MatchesState> {
  return {
    matches: [],
    fetching: false,
    error: null,
    removal: {
      targettedId: null,
      isModalOpen: false,
    },
  };
}