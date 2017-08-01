import { RouteComponentProps } from 'react-router';
import { connect } from 'react-redux';
import { MembersPageDispatchProps, MembersPageStateProps, MembersPage as Component } from './MembersPage';
import { ApplicationState } from '../../state/ApplicationState';
import { Dispatch } from 'redux';
import * as React from 'react';
import { MembersActions } from '../../state/MembersState';
import { contains } from 'ramda';

const mapStateToProps = (state: ApplicationState): MembersPageStateProps => ({
  ...state.members,
  canModify: state.authentication.loggedIn && contains(
    'moderator',
    state.authentication.data!.accessTokenClaims.permissions,
  ),
});

const mapDispatchToProps = (dispatch: Dispatch<ApplicationState>): MembersPageDispatchProps => ({
  fetchPermissionList: (): Promise<void> => dispatch(MembersActions.refetchPermissions()),
  fetchModerationLog: (): Promise<void> => dispatch(MembersActions.refetchModerationLog()),
  togglePermissionExpanded: (perm: string): void => dispatch(MembersActions.togglePermissionExpanded(perm)),
  openAddPermission: (perm: string) => (): void => {
    dispatch(MembersActions.openAddPermissionDialog(perm));
  },
  openRemovePermission: (permission: string, username: string) => (): void => {
    dispatch(MembersActions.openRemovePermissionDialog({ username, permission }));
  },
});

export const MembersPage: React.ComponentClass<RouteComponentProps<any>> =
  connect<MembersPageStateProps, MembersPageDispatchProps, RouteComponentProps<any>>(
    mapStateToProps,
    mapDispatchToProps,
  )(Component);
