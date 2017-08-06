import { RouteComponentProps } from 'react-router';
import { connect } from 'react-redux';
import { MatchesPageDispatchProps, MatchesPageStateProps, MatchesPage as Component } from './MatchesPage';
import { ApplicationState } from '../../state/ApplicationState';
import { Dispatch } from 'redux';
import { MatchesActions, MatchesState } from '../../state/MatchesState';
import * as React from 'react';
import { getUsername, matchesPermissions } from '../../state/Selectors';
import { createSelector } from 'reselect';

const stateSelector = createSelector<ApplicationState, boolean, string | null, MatchesState, MatchesPageStateProps>(
  matchesPermissions('moderator'),
  getUsername,
  state => state.matches,
  (isModerator, username, matches) => ({
    ...matches,
    isModerator,
    username,
    isRemovalModalOpen: matches.removal.isModalOpen,
    isApprovalModalOpen: matches.approval.isModalOpen,
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
    }),
  )(Component);
