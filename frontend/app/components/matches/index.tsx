import { RouteComponentProps } from 'react-router';
import { connect } from 'react-redux';
import { MatchesPageDispatchProps, MatchesPageStateProps, MatchesPage as Component } from './MatchesPage';
import { ApplicationState } from '../../state/ApplicationState';
import { Dispatch } from 'redux';
import { MatchesActions, MatchesState } from '../../state/MatchesState';
import * as React from 'react';
import { getUsername, matchesPermissions } from '../../state/Selectors';
import { createSelector } from 'reselect';
import { Match } from '../../Match';

const visibleMatchesSelector = createSelector<ApplicationState, string | null, boolean, boolean, Match[], Match[]>(
  getUsername,
  state => state.matches.hideRemoved,
  state => state.matches.showOwnRemoved,
  state => state.matches.matches,
  (username, hideRemoved, showOwnRemoved, matches) => {
    if (!hideRemoved)
      return matches;

    if (!showOwnRemoved)
      return matches.filter(m => !m.removed);

    return matches.filter(m => !m.removed || m.author === username);
  },
);

const stateSelector = createSelector<
  ApplicationState,
  boolean,
  string | null,
  MatchesState,
  Match[],
  MatchesPageStateProps
  >(
  matchesPermissions('moderator'),
  getUsername,
  state => state.matches,
  visibleMatchesSelector,
  (isModerator, username, matchesState, visibleMatches) => ({
    ...matchesState,
    isModerator,
    username,
    matches: visibleMatches, // Override the matches in the state with only the visible ones
  }),
);

export const MatchesPage: React.ComponentClass<RouteComponentProps<any>> =
  connect<MatchesPageStateProps, MatchesPageDispatchProps, RouteComponentProps<any>>(
    stateSelector,
    (dispatch: Dispatch<ApplicationState>): MatchesPageDispatchProps => ({
      refetch: () => dispatch(MatchesActions.refetch()),
      closeRemovalModal: () => dispatch(MatchesActions.closeRemovalModal()),
      closeApprovalModal: () => dispatch(MatchesActions.closeApprovalModal()),
      openRemovalModal: (id: number) => dispatch(MatchesActions.askForRemovalReason(id)),
      openApprovalModal: (id: number) => dispatch(MatchesActions.askForApproval(id)),
      submitRemoval: (reason: string) => dispatch(MatchesActions.confirmRemove(reason)),
      submitApproval: () => dispatch(MatchesActions.confirmApproval()),
      toggleHideRemoved: () => dispatch(MatchesActions.toggleHideRemoved()),
      toggleShowOwnRemoved: () => dispatch(MatchesActions.toggleShowOwnRemoved()),
    }),
  )(Component);
