import { RouteComponentProps } from 'react-router';
import { connect } from 'react-redux';
import { MembersPageDispatchProps, MembersPageStateProps, MembersPage as Component } from './MembersPage';
import { ApplicationState } from '../../state/ApplicationState';
import { Dispatch } from 'redux';
import * as React from 'react';
import { MembersActions, MembersState } from '../../state/MembersState';
import { getPermissions } from '../../state/Selectors';
import { createSelector } from 'reselect';
import { Obj, flatten, map } from 'ramda';

const allowedModifications: Obj<string[]> = {
  'hosting advisor': ['host', 'trial host'],
  admin: ['trial host', 'host', 'hosting advisor', 'ubl moderator'],
};

const stateSelector = createSelector<ApplicationState, string[], MembersState, MembersPageStateProps>(
  getPermissions,
  state => state.members,
  (permissions, members) => ({
    ...members,
    canModify: flatten<string>(map<string, string[]>(perm => allowedModifications[perm] || [], permissions)),
  }),
);

export const MembersPage: React.ComponentClass<RouteComponentProps<any>> =
  connect<MembersPageStateProps, MembersPageDispatchProps, RouteComponentProps<any>>(
    stateSelector,
    (dispatch: Dispatch<ApplicationState>): MembersPageDispatchProps => ({
      fetchPermissionList: (): Promise<void> => dispatch(MembersActions.refetchPermissions()),
      fetchModerationLog: (): Promise<void> => dispatch(MembersActions.refetchModerationLog()),
      toggleNodeExpanded: (id: string): void => dispatch(MembersActions.toggleNodeExpanded(id)),
      openAddPermission: (perm: string): void => {
        dispatch(MembersActions.openAddPermissionDialog(perm));
      },
      openRemovePermission: (permission: string, username: string): void => {
        dispatch(MembersActions.openRemovePermissionDialog({ username, permission }));
      },
    }),
  )(Component);
