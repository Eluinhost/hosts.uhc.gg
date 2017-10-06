import { RouteComponentProps } from 'react-router';
import { connect } from 'react-redux';
import { MembersPageDispatchProps, MembersPageStateProps, MembersPage as Component } from './MembersPage';
import { ApplicationState } from '../../state/ApplicationState';
import { Dispatch } from 'redux';
import * as React from 'react';
import { PermissionsState } from '../../state/PermissionsState';
import { getPermissions } from '../../state/Selectors';
import { createSelector } from 'reselect';
import { Obj, flatten, map } from 'ramda';
import { AddPermission, ExpandedPermissionNodes, RefreshPermissions, RemovePermission } from '../../actions';

const allowedModifications: Obj<string[]> = {
  'hosting advisor': ['host', 'trial host', 'hosting banned'],
  admin: ['trial host', 'host', 'hosting advisor', 'ubl moderator'],
};

const stateSelector = createSelector<ApplicationState, string[], PermissionsState, MembersPageStateProps>(
  getPermissions,
  state => state.permissions,
  (permissions, members) => ({
    ...members,
    canModify: flatten<string>(map<string, string[]>(perm => allowedModifications[perm] || [], permissions)),
  }),
);

export const MembersPage: React.ComponentClass<RouteComponentProps<any>> =
  connect<MembersPageStateProps, MembersPageDispatchProps, RouteComponentProps<any>>(
    stateSelector,
    (dispatch: Dispatch<ApplicationState>): MembersPageDispatchProps => ({
      fetchPermissionList: () => dispatch(RefreshPermissions.start()),
      toggleNodeExpanded: (id: string) => dispatch(ExpandedPermissionNodes.toggle(id)),
      openAddPermission: (perm: string) => dispatch(AddPermission.openDialog(perm)),
      openRemovePermission: (permission: string, username: string) => dispatch(
        RemovePermission.openDialog({ username, permission }),
      ),
    }),
  )(Component);
