import { RouteComponentProps } from 'react-router';
import { connect } from 'react-redux';
import { MatchesPageDispatchProps, MatchesPageStateProps, MatchesPage as Component } from './MatchesPage';
import { ApplicationState } from '../../state/ApplicationState';
import { Dispatch } from 'redux';
import { MatchesActions } from '../../state/MatchesState';
import { contains } from 'ramda';
import * as React from 'react';

const mapStateToProps = (state: ApplicationState): MatchesPageStateProps => {
  if (state.authentication.loggedIn) {
    return {
      ...state.matches,
      isModerator: contains('moderator', state.authentication.data!.accessTokenClaims.permissions),
      username: state.authentication.data!.accessTokenClaims.username,
      isModalOpen: state.matches.removal.isModalOpen,
    };
  }

  return {
    ...state.matches,
    isModerator: false,
    username: null,
    isModalOpen: state.matches.removal.isModalOpen,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<ApplicationState>): MatchesPageDispatchProps => ({
  refetch: () => dispatch(MatchesActions.refetch()),
  closeModal: () => dispatch(MatchesActions.closeModal()),
  openModal: (id: number) => dispatch(MatchesActions.askForReason(id)),
  submitRemoval: (reason: string) => dispatch(MatchesActions.confirmRemove(reason)),
});

export const MatchesPage: React.ComponentClass<RouteComponentProps<any>> =
  connect<MatchesPageStateProps, MatchesPageDispatchProps, RouteComponentProps<any>>(
    mapStateToProps,
    mapDispatchToProps,
  )(Component);
