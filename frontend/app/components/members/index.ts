import { RouteComponentProps } from 'react-router';
import { connect } from 'react-redux';
import { MembersPageDispatchProps, MembersPageStateProps, MembersPage as Component } from './MembersPage';
import { ApplicationState } from '../../state/ApplicationState';
import { Dispatch } from 'redux';
import * as React from 'react';
import { MembersActions, MembersState } from '../../state/MembersState';
import { matchesPermissions } from '../../state/Selectors';
import { createSelector } from 'reselect';

const stateSelector = createSelector<ApplicationState, boolean, MembersState, MembersPageStateProps>(
  matchesPermissions('moderator'),
  state => state.members,
  (canModify, members) => ({
    ...members,
    canModify,
  }),
);

export const MembersPage: React.ComponentClass<RouteComponentProps<any>> =
  connect<MembersPageStateProps, MembersPageDispatchProps, RouteComponentProps<any>>(
    stateSelector,
    (dispatch: Dispatch<ApplicationState>): MembersPageDispatchProps => ({
      fetchPermissionList: (): Promise<void> => dispatch(MembersActions.refetchPermissions()),
      fetchModerationLog: (): Promise<void> => dispatch(MembersActions.refetchModerationLog()),
      togglePermissionExpanded: (perm: string): void => dispatch(MembersActions.togglePermissionExpanded(perm)),
      openAddPermission: (perm: string) => (): void => {
        dispatch(MembersActions.openAddPermissionDialog(perm));
      },
      openRemovePermission: (permission: string, username: string) => (): void => {
        dispatch(MembersActions.openRemovePermissionDialog({ username, permission }));
      },
    }),
  )(Component);
