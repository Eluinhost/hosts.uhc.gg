import { Action, createAction } from 'redux-actions';
import { buildReducer } from './buildReducer';
import { Reducer } from 'redux';
import { Match } from '../Match';
import { ThunkAction } from 'redux-thunk';
import { ApplicationState } from './ApplicationState';
import {
  ApiError,
  fetchUpcomingMatches,
  ForbiddenError,
  NotAuthenticatedError,
  removeMatch,
  UnexpectedResponseError,
} from '../api/index';

export type MatchRemovalModelState = {
  readonly isModalOpen: boolean;
  readonly targettedId?: number;
  readonly fetching: boolean;
  readonly error?: string;
  readonly reason: string;
  readonly validReason: boolean;
};

export type MatchModerationState = {
  readonly matches: Match[];
  readonly fetching: boolean;
  readonly error?: string;
  readonly removal: MatchRemovalModelState;
};

// TODO removal should just set a flag in the match object as removed instead of actually deleting it in the lsit
// and then show the removal reason in the list.

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
const removalError = createAction<string>('MATCH_MODERATION_REMOVAL_ERROR');

const setDeleteTarget = createAction<number>('MATCH_MODERATION_SET_DELETE_TARGET');
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
      dispatch(setDeleteTarget(id));
      dispatch(openModal());
    };
  },
  /**
   * Sends actual deletion request
   */
  confirmDelete(): ThunkAction<Promise<any>, ApplicationState, {}> {
    return (dispatch, getState) => {
      const state = getState();

      const id = state.matchModeration.removal.targettedId!;
      const reason = state.matchModeration.removal.reason;
      const authentication = state.authentication;

      dispatch(startRemoval({ id, reason, user: state.authentication.data!.claims.username }));

      return removeMatch(id, reason, authentication)
        .then(data => dispatch(endRemoval()))
        .catch((err) => {
          if (err instanceof NotAuthenticatedError)
            return dispatch(removalError('You are not logged in')); // TODO some kind of 'relogin' action

          if (err instanceof ForbiddenError)
            return dispatch(removalError('You do not have permissions to use this'));

          if (err instanceof UnexpectedResponseError)
            return dispatch(removalError('Unexpected response from the server'));

          return dispatch(removalError('Unable to remove item from server'));
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
  buildReducer<MatchModerationState>()
    .handle(startFetch, (state) => {
      return {
        ...state,
        fetching: true,
        error: undefined,
      };
    })
    .handle(endFetch, (state, action) => {
      return {
        ...state,
        fetching: false,
        error: undefined,
        matches: action.payload,
      };
    })
    .handle(fetchError, (state, action) => {
      return {
        ...state,
        fetching: false,
        error: action.payload,
      };
    })
    .handle(setDeleteTarget, (state, action) => {
      return {
        ...state,
        removal: {
          ...state.removal,
          targettedId: action.payload!,
        },
      };
    })
    .handle(openModal, (state) => {
      return {
        ...state,
        removal: {
          ...state.removal,
          isModalOpen: true,
        },
      };
    })
    .handle(MatchModerationActions.closeModal, (state) => {
      return {
        ...state,
        removal: {
          ...state.removal,
          isModalOpen: false,
        },
      };
    })
    .handle(startRemoval, (state, action: Action<StartRemovalPayload>) => {
      const { id, reason, user } = action.payload!;

      return {
        ...state,
        matches: state.matches.map((match) => {
          if (match.id === id) {
            return {
              ...match,
              removed: true,
              removedBy: user,
              removedReason: reason,
            };
          }

          return match;
        }),
        removal: {
          ...state.removal,
          fetching: true,
          error: undefined,
        },
      };
    })
    .handle(endRemoval, (state) => {
      return {
        ...state,
        removal: {
          ...state.removal,
          fetching: false,
          error: undefined,
          isModalOpen: false,
        },
      };
    })
    .handle(removalError, (state, action) => {
      const id = state.removal.targettedId;

      return {
        ...state,
        matches: state.matches.map((match) => {
          if (match.id === id) {
            return {
              ...match,
              removed: false,
              removedReason: null,
              removedBy: null,
            };
          }

          return match;
        }),
        optimisticDeletes: undefined,
        removal: {
          ...state.removal,
          fetching: false,
          error: action.payload!,
        },
      };
    })
    .handle(MatchModerationActions.updateReason, (state, action) => {
      return {
        ...state,
        removal: {
          ...state.removal,
          reason: action.payload,
          validReason: action.payload!.trim().length > 0,
        },
      };
    })
    .done();

export async function initialValues(): Promise<MatchModerationState> {
  return {
    matches: [],
    fetching: false,
    removal: {
      isModalOpen: false,
      fetching: false,
      reason: '',
      validReason: false,
    },
  };
}
