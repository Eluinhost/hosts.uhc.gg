import { Action, createAction } from 'redux-actions';
import { ReducerBuilder } from './ReducerBuilder';
import { Match } from '../Match';
import { ThunkAction } from 'redux-thunk';
import { ApplicationState } from './ApplicationState';
import {
  approveMatch,
  fetchUpcomingMatches,
  ForbiddenError,
  NotAuthenticatedError,
  removeMatch,
  UnexpectedResponseError,
} from '../api/index';
import { always, T, F, evolve, propEq, map, when } from 'ramda';
import { Reducer } from 'redux';
import { AuthenticationActions } from './AuthenticationState';
import { getAccessToken, getUsername } from './Selectors';
import { storage } from '../storage';

export type MatchModelState = {
  readonly isModalOpen: boolean;
  readonly targettedId: number | null;
};

export type MatchesState = {
  readonly matches: Match[];
  readonly fetching: boolean;
  readonly error: string | null;
  readonly hideRemoved: boolean;
  readonly showOwnRemoved: boolean;
  readonly removal: MatchModelState;
  readonly approval: MatchModelState;
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
const openRemovalModal = createAction('MATCHES_OPEN_REMOVAL_MODAL');

type StartApprovalPayload = {
  id: number;
  user: string;
};
const startApproval = createAction<StartApprovalPayload>('MATCHES_START_APPROVAL');
const endApproval = createAction('MATCHES_END_APPROVAL');
const approvalError = createAction<number>('MATCHES_APPROVAL_ERROR');

const openApprovalModal = createAction('MATCHES_OPEN_APPROVAL_MODAL');
const setApprovalTarget = createAction<number>('MATCHES_SET_APPROVAL_TARGET');

const setHideRemoved = createAction<boolean>('SET_HIDE_REMOVED');
const setShowOwnRemoved = createAction<boolean>('SET_SHOW_OWN_REMOVED');

export const MatchesActions = {

  /**
   * Refetches match list
   */
  refetch: (): ThunkAction<Promise<void>, ApplicationState, {}> => async (dispatch): Promise<void> => {
    dispatch(startFetch());

    try {
      const data = await fetchUpcomingMatches();

      dispatch(endFetch(data));
    } catch (err) {
      if (err instanceof NotAuthenticatedError)
        dispatch(fetchError('You are not logged in'));

      if (err instanceof ForbiddenError)
        dispatch(fetchError('You do not have permissions to do this'));

      if (err instanceof UnexpectedResponseError)
        dispatch(fetchError('Uexpected response from the server'));

      dispatch(fetchError('Unable to fetch list from server'));

      throw err;
    }
  },
  /**
   * Shows modal for confirmation
   */
  askForRemovalReason: (id: number): ThunkAction<void, ApplicationState, {}> => (dispatch): void => {
    dispatch(setRemovalTarget(id));
    dispatch(openRemovalModal());
  },
  askForApproval: (id: number): ThunkAction<void, ApplicationState, {}> => (dispatch): void => {
    dispatch(setApprovalTarget(id));
    dispatch(openApprovalModal());
  },
  /**
   * Sends actual deletion request
   */
  confirmRemove: (reason: string): ThunkAction<Promise<void>, ApplicationState, {}> =>
    async (dispatch, getState): Promise<void> => {
      const state = getState();

      const id = state.matches.removal.targettedId!;

      dispatch(startRemoval({ id, reason, user: getUsername(state) || 'ERROR NO USERNAME IN STATE' }));

      try {
        await removeMatch(id, reason, getAccessToken(state) || 'ERROR NO AUTHENTICATION TOKEN IN STATE');

        dispatch(endRemoval());
      } catch (err) {
        dispatch(removalError(id));

        if (err instanceof NotAuthenticatedError || err instanceof ForbiddenError) {
          dispatch(AuthenticationActions.logout());
        }

        throw err;
      }
    },
  /**
   * Sends actual approval request
   */
  confirmApproval: (): ThunkAction<Promise<void>, ApplicationState, {}> =>
    async (dispatch, getState): Promise<void> => {
      const state = getState();

      const id = state.matches.approval.targettedId!;

      dispatch(startApproval({ id, user: getUsername(state) || 'ERROR NO USERNAME IN STATE' }));

      try {
        await approveMatch(id, getAccessToken(state) || 'ERROR NO AUTHENTICATION TOKEN IN STATE');

        dispatch(endApproval());
      } catch (err) {
        dispatch(approvalError(id));

        if (err instanceof NotAuthenticatedError || err instanceof ForbiddenError) {
          dispatch(AuthenticationActions.logout());
        }

        throw err;
      }
    },
  /**
   * Simply closes the removal modal, a 'cancel' action
   */
  closeRemovalModal: createAction('MATCHES_CLOSE_REMOVAL_MODAL'),
  closeApprovalModal: createAction('MATCHES_CLOSE_APPROVAL_MODAL'),
  updateReason: createAction<string>('MATCHES_UPDATE_REASON'),
  toggleHideRemoved: (): ThunkAction<boolean, ApplicationState, {}> => (dispatch, getState): boolean => {
    const newStatus = !getState().matches.hideRemoved;

    dispatch(setHideRemoved(newStatus));
    storage.setItem('matches-page-hide-removed', newStatus);

    return newStatus;
  },
  toggleShowOwnRemoved: (): ThunkAction<boolean, ApplicationState, {}> => (dispatch, getState): boolean => {
    const newStatus = !getState().matches.showOwnRemoved;

    dispatch(setShowOwnRemoved(newStatus));
    storage.setItem('matches-page-show-own-removed', newStatus);

    return newStatus;
  },
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
    .handleEvolve(setApprovalTarget, (action: Action<number>) => ({
      approval: {
        targettedId: always(action.payload),
      },
    }))
    .handleEvolve(openRemovalModal, {
      removal: {
        isModalOpen: T,
      },
    })
    .handleEvolve(MatchesActions.closeRemovalModal, {
      removal: {
        isModalOpen: F,
      },
    })
    .handleEvolve(openApprovalModal, {
      approval: {
        isModalOpen: T,
      },
    })
    .handleEvolve(MatchesActions.closeApprovalModal, {
      approval: {
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
    .handleEvolve(startApproval, (action: Action<StartApprovalPayload>) => ({
      matches: map(
        when(
          propEq('id', action.payload!.id),
          evolve({
            approvedBy: always(action.payload!.user),
          }),
        ),
      ),
    }))
    .handleEvolve(approvalError, (action: Action<number>) => ({
      matches: map(
        when(
          propEq('id', action.payload!),
          evolve({
            approvedBy: always(null),
          }),
        ),
      ),
    }))
    .handleEvolve(setHideRemoved, (action: Action<boolean>) => ({
      hideRemoved: always(action.payload),
    }))
    .handleEvolve(setShowOwnRemoved, (action: Action<boolean>) => ({
      showOwnRemoved: always(action.payload),
    }))
    .build();

export const initialValues = async (): Promise<MatchesState> => {
  const hideRemoved: boolean | null = await storage.getItem<boolean>('matches-page-hide-removed');
  const showOwnRemoved: boolean | null = await storage.getItem<boolean>('matches-page-show-own-removed');

  return {
    matches: [],
    fetching: false,
    error: null,
    hideRemoved: hideRemoved === null ? true : hideRemoved,
    showOwnRemoved: showOwnRemoved === null ? true : showOwnRemoved,
    removal: {
      targettedId: null,
      isModalOpen: false,
    },
    approval: {
      targettedId: null,
      isModalOpen: false,
    },
  };
};
