import { Action, createAction } from 'redux-actions';
import { buildReducer } from './buildReducer';
import { Reducer } from 'redux';
import { Match } from '../Match';
import { ThunkAction } from 'redux-thunk';
import { ApplicationState } from './ApplicationState';

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
  readonly optimisticDelete?: Match;
  readonly fetching: boolean;
  readonly error?: string;
  readonly removal: MatchRemovalModelState;
};

// TODO removal should just set a flag in the match object as removed instead of actually deleting it in the lsit
// and then show the removal reason in the list.

const startFetch = createAction('MATCH_MODERATION_START_FETCH');
const endFetch = createAction<Match[]>('MATCH_MODERATION_END_FETCH');
const fetchError = createAction<string>('MATCH_MODERATION_FETCH_ERROR');

const startRemoval = createAction<Match>('MATCH_MODERATION_START_REMOVAL');
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

      return fetch('/api/matches')
        .then(_ => _.json()) // TODO status code
        .then((data) => {
          dispatch(endFetch(data));
        })
        .catch((err) => {
          console.error(err);

          dispatch(fetchError('Unable to fetch list from server'));
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
  confirmDelete(): ThunkAction<void, ApplicationState, {}> {
    return (dispatch, getState) => {
      const state = getState();
      const match = state.matchModeration.matches
        .find(it => it.id === state.matchModeration.removal.targettedId)!;

      dispatch(startRemoval(match));

      // TODO include reason
      return fetch(`/api/matches/${match.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.authentication.data!.raw}`,
        },
        body: JSON.stringify({ reason: state.matchModeration.removal.reason }),
      })
        .then((response) => {
          if (response.status !== 204) {
            throw new Error('Invalid response');
          }
        })
        .then(() => {
          dispatch(endRemoval());
        })
        .catch((err) => {
          console.error(err);

          dispatch(removalError('Failed to remove match'));
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
    .handle(startRemoval, (state, action: Action<Match>) => {
      return {
        ...state,
        matches: state.matches.filter(it => it.id !== action.payload!.id),
        optimisticDelete: action.payload!,
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
        optimisticDelete: undefined,
        removal: {
          ...state.removal,
          fetching: false,
          error: undefined,
          isModalOpen: false,
        },
      };
    })
    .handle(removalError, (state, action) => {
      return {
        ...state,
        matches: [...state.matches, state.optimisticDelete!],
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
