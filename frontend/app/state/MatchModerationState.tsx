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

export type MatchRemovalModelState = {
  readonly isModalOpen: boolean;
  readonly targettedId: number | null;
  readonly fetching: boolean;
  readonly error: string | null;
  readonly reason: string;
  readonly validReason: boolean;
};

export type MatchModerationState = {
  readonly matches: Match[];
  readonly fetching: boolean;
  readonly error: string | null;
  readonly removal: MatchRemovalModelState;
};

const startFetch = createAction('MATCH_MODERATION_START_FETCH');
const endFetch = createAction<Match[]>('MATCH_MODERATION_END_FETCH');
const fetchError = createAction<string>('MATCH_MODERATION_FETCH_ERROR');

type StartRemovalPayload = {
  id: number;
  reason: string;
  user: string;
};
const startRemoval = createAction<StartRemovalPayload>('MATCH_MODERATION_START_REMOVAL');
const endRemoval = createAction('MATCH_MODERATION_END_REMOVAL');
type RemovalErrorPayload = {
  id: number;
  error: string;
};
const removalError = createAction<RemovalErrorPayload>('MATCH_MODERATION_REMOVAL_ERROR');

const setRemovalTarget = createAction<number>('MATCH_MODERATION_SET_REMOVAL_TARGET');
const openModal = createAction('MATCH_MODERATION_OPEN_MODAL');

export const MatchModerationActions = {
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
  confirmRemove(): ThunkAction<Promise<any>, ApplicationState, {}> {
    return (dispatch, getState) => {
      const state = getState();

      const id = state.matchModeration.removal.targettedId!;
      const reason = state.matchModeration.removal.reason;
      const authentication = state.authentication;

      dispatch(startRemoval({ id, reason, user: state.authentication.data!.accessTokenClaims.username }));

      return removeMatch(id, reason, authentication)
        .then(data => dispatch(endRemoval()))
        .catch((err) => {
          if (err instanceof NotAuthenticatedError)
            return dispatch(removalError({ id, error: 'You are not logged in' })); // TODO some kind of 'relogin' action

          if (err instanceof ForbiddenError)
            return dispatch(removalError({ id, error: 'You do not have permissions to use this' }));

          if (err instanceof UnexpectedResponseError)
            return dispatch(removalError({ id, error: 'Unexpected response from the server' }));

          return dispatch(removalError({ id, error: 'Unable to remove item from server' }));
        });
    };
  },
  /**
   * Simply closes the removal modal, a 'cancel' action
   */
  closeModal: createAction('MATCH_MODERATION_CLOSE_MODAL'),
  updateReason: createAction<string>('MATCH_MODERATION_UPDATE_REASON'),
};

export const reducer: Reducer<MatchModerationState> =
  new ReducerBuilder<MatchModerationState>()
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
    .handleEvolve(MatchModerationActions.closeModal, {
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
      removal: {
        fetching: T,
        error: always(null),
      },
    }))
    .handleEvolve(endRemoval, {
      removal: {
        fetching: F,
        error: always(null),
        isModalOpen: F,
      },
    })
    .handleEvolve(removalError, (action: Action<RemovalErrorPayload>) => ({
      matches: map(
        when(
          propEq('id', action.payload!.id),
          evolve({
            removed: T,
            removedBy: always(null),
            removedReason: always(null),
          }),
        ),
      ),
      removal: {
        fetching: F,
        error: always(action.payload!.error),
      },
    }))
    .handleEvolve(MatchModerationActions.updateReason, (action: Action<string>) => ({
      removal: {
        reason: always(action.payload),
        validReason: always(action.payload!.trim().length > 0),
      },
    }))
    .build();

export async function initialValues(): Promise<MatchModerationState> {
  return {
    matches: [],
    fetching: false,
    error: null,
    removal: {
      targettedId: null,
      error: null,
      isModalOpen: false,
      fetching: false,
      reason: '',
      validReason: false,
    },
  };
}
