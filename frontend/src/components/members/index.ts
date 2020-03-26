import { RouteComponentProps } from 'react-router';
import { connect } from 'react-redux';
import { MembersPageDispatchProps, MembersPageStateProps, MembersPage as Component } from './MembersPage';
import { ApplicationState } from '../../state/ApplicationState';
import { Dispatch } from 'redux';
import * as React from 'react';
import { PermissionsState } from '../../state/PermissionsState';
import { getPermissions } from '../../state/Selectors';
import { createSelector } from 'reselect';
import { flatten, map } from 'ramda';
import {
  AddPermission,
  FetchUserCountPerPermission,
  PermissionLetterNode,
  PermissionNode,
  RemovePermission,
} from '../../actions';

const stateSelector = createSelector<ApplicationState, string[], PermissionsState, MembersPageStateProps>(
  getPermissions,
  state => state.permissions,
  (permissions, permissionState) => ({
    ...permissionState,
    canModify: flatten<string>(
      map<string, string[]>(perm => permissionState.allowableModifications[perm] || [], permissions),
    ),
  }),
);

export const MembersPage: React.ComponentClass<RouteComponentProps<any>> = connect<
  MembersPageStateProps,
  MembersPageDispatchProps,
  RouteComponentProps<any>
>(stateSelector, (dispatch: Dispatch<ApplicationState>): MembersPageDispatchProps => ({
  fetchPermissionList: () => dispatch(FetchUserCountPerPermission.start()),
  expandPermissionNode: (permission: string) => dispatch(PermissionNode.open(permission)),
  expandLetterNode: (permission: string, letter: string) => dispatch(PermissionLetterNode.open({ permission, letter })),
  collapsePermissionNode: (permission: string) => dispatch(PermissionNode.close(permission)),
  collapseLetterNode: (permission: string, letter: string) =>
    dispatch(PermissionLetterNode.close({ permission, letter })),
  openAddPermission: (perm: string) => dispatch(AddPermission.openDialog(perm)),
  openRemovePermission: (permission: string, username: string) =>
    dispatch(RemovePermission.openDialog({ username, permission })),
}))(Component);
