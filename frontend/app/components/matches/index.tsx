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
    isModalOpen: matches.removal.isModalOpen,
  }),
);

export const MatchesPage: React.ComponentClass<RouteComponentProps<any>> =
  connect<MatchesPageStateProps, MatchesPageDispatchProps, RouteComponentProps<any>>(
    stateSelector,
    (dispatch: Dispatch<ApplicationState>): MatchesPageDispatchProps => ({
      refetch: () => dispatch(MatchesActions.refetch()),
      closeModal: () => dispatch(MatchesActions.closeModal()),
      openModal: (id: number) => dispatch(MatchesActions.askForReason(id)),
      submitRemoval: (reason: string) => dispatch(MatchesActions.confirmRemove(reason)),
    }),
  )(Component);
