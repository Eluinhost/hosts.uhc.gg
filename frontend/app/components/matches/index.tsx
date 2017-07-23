import { RouteComponentProps } from 'react-router';
import { connect } from 'react-redux';
import { MatchesPageDispatchProps, MatchesPageStateProps, MatchesPage as Component } from './MatchesPage';
import { ApplicationState } from '../../state/ApplicationState';
import { Dispatch } from 'redux';
import { MatchesActions } from '../../state/MatchesState';
import { contains } from 'ramda';
import * as React from 'react';

function mapStateToProps(state: ApplicationState): MatchesPageStateProps {
  return {
    ...state.matches,
    isModerator: contains('moderator', state.authentication.data!.accessTokenClaims.permissions),
    username: state.authentication.data!.accessTokenClaims.username,
  };
}

function mapDispatchToProps(dispatch: Dispatch<ApplicationState>): MatchesPageDispatchProps {
  return {
    refetch: () => dispatch(MatchesActions.refetch()),
    confirmRemove: () => dispatch(MatchesActions.confirmRemove()),
    updateReason: (reason: string) => dispatch(MatchesActions.updateReason(reason)),
    closeModal: () => dispatch(MatchesActions.closeModal()),
    askForReason: (id: number) => dispatch(MatchesActions.askForReason(id)),
  };
}


export const MatchesPage: React.ComponentClass<RouteComponentProps<any>> =
  connect<MatchesPageStateProps, MatchesPageDispatchProps, RouteComponentProps<any>>(
    mapStateToProps,
    mapDispatchToProps,
  )(Component);
