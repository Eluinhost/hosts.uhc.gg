import { RouteComponentProps } from 'react-router';
import { connect } from 'react-redux';
import { MembersPageDispatchProps, MembersPageStateProps, MembersPage as Component } from './MembersPage';
import { ApplicationState } from '../../state/ApplicationState';
import { Dispatch } from 'redux';
import * as React from 'react';
import { MembersActions } from '../../state/MembersState';

function mapStateToProps(state: ApplicationState): MembersPageStateProps {
  return state.members;
}

function mapDispatchToProps(dispatch: Dispatch<ApplicationState>): MembersPageDispatchProps {
  return {
    fetchPermissionList: () => dispatch(MembersActions.refetchPermissions()),
    fetchModerationLog: () => dispatch(MembersActions.refetchModerationLog()),
    togglePermissionExpanded: (perm: string) => dispatch(MembersActions.togglePermissionExpanded(perm)),
  };
}

export const MembersPage: React.ComponentClass<RouteComponentProps<any>> =
  connect<MembersPageStateProps, MembersPageDispatchProps, RouteComponentProps<any>>(
    mapStateToProps,
    mapDispatchToProps,
  )(Component);
