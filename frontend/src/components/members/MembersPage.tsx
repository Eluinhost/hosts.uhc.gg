import React, { useCallback, useEffect, useMemo } from 'react';
import { Button, H2, Intent, NonIdealState, Spinner, Tree, TreeEventHandler } from '@blueprintjs/core';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector, Selector } from 'reselect';
import { flatten, map } from 'ramda';
import { ApplicationState } from '../../state/ApplicationState';
import { getPermissions } from '../../state/Selectors';
import { BasicNode, LetterFolder, PermissionsState, UsernameNode } from '../../state/PermissionsState';
import {
  AddPermission,
  FetchUserCountPerPermission,
  PermissionLetterNode,
  PermissionNode,
  RemovePermission,
} from '../../actions';
import { AddPermissionDialog } from './AddPermissionDialog';
import { RemovePermissionDialog } from './RemovePermissionDialog';
import { Title } from '../Title';
import { ModerationLog } from './ModerationLog';

type MembersPageState = PermissionsState & {
  readonly canModify: string[];
};

const stateSelector: Selector<ApplicationState, MembersPageState> = createSelector(
  getPermissions,
  state => state.permissions,
  (permissions, permissionState) => ({
    ...permissionState,
    canModify: flatten(map(perm => permissionState.allowableModifications[perm] || [], permissions)),
  }),
);

export const MembersPage = React.memo(() => {
  const { nodes, isFetching, canModify } = useSelector(stateSelector);
  const dispatch = useDispatch();

  const fetchPermissionList = useCallback(() => dispatch(FetchUserCountPerPermission.start()), [dispatch]);
  const openAddPermission = useCallback((perm: string) => dispatch(AddPermission.openDialog(perm)), [dispatch]);
  const openRemovePermission = useCallback(
    (permission: string, username: string) => dispatch(RemovePermission.openDialog({ username, permission })),
    [dispatch],
  );
  const expandPermissionNode = useCallback((permission: string) => dispatch(PermissionNode.open(permission)), [
    dispatch,
  ]);
  const expandLetterNode = useCallback(
    (permission: string, letter: string) => dispatch(PermissionLetterNode.open({ permission, letter })),
    [dispatch],
  );
  const collapsePermissionNode = useCallback((permission: string) => dispatch(PermissionNode.close(permission)), [
    dispatch,
  ]);
  const collapseLetterNode = useCallback(
    (permission: string, letter: string) => dispatch(PermissionLetterNode.close({ permission, letter })),
    [dispatch],
  );

  useEffect(() => {
    fetchPermissionList();
  }, [fetchPermissionList]);

  const canModifyFn = useCallback((permission: string): boolean => canModify.indexOf(permission) >= 0, [canModify]);

  const onNodeClick: TreeEventHandler = useCallback(
    (n): void => {
      const node = n as BasicNode;

      if (!canModifyFn(node.permission)) return;

      switch (node.type) {
        case 'permission':
          openAddPermission(node.permission);
          break;
        case 'username':
          openRemovePermission(node.permission, (node as UsernameNode).username);
      }
    },
    [canModifyFn, openAddPermission, openRemovePermission],
  );

  const collapseNode: TreeEventHandler = useCallback(
    (n): void => {
      const node = n as BasicNode;

      switch (node.type) {
        case 'permission':
          collapsePermissionNode(node.permission);
          break;
        case 'letter':
          collapseLetterNode(node.permission, (node as LetterFolder).letter);
          break;
      }
    },
    [collapsePermissionNode, collapseLetterNode],
  );

  const expandNode: TreeEventHandler = useCallback(
    (n): void => {
      const node = n as BasicNode;

      switch (node.type) {
        case 'permission':
          expandPermissionNode(node.permission);
          break;
        case 'letter':
          expandLetterNode(node.permission, (node as LetterFolder).letter);
          break;
      }
    },
    [expandPermissionNode, expandLetterNode],
  );

  const nodesWithClassNames = useMemo(
    () =>
      nodes.map(node => {
        if (!canModifyFn(node.permission)) return node;

        return {
          ...node,
          className: `${node.className} editable-permission-node`,
        };
      }),
    [nodes, canModifyFn],
  );

  const renderPermissionsTree = () => {
    if (isFetching) return <NonIdealState icon={<Spinner />} title="Loading..." />;

    return (
      <div className="permissions-tree">
        <H2>All members</H2>
        <Tree
          contents={nodesWithClassNames}
          onNodeCollapse={collapseNode}
          onNodeExpand={expandNode}
          onNodeClick={onNodeClick}
        />
        <Button disabled={isFetching} onClick={fetchPermissionList} icon="refresh" intent={Intent.SUCCESS}>
          Refresh
        </Button>
      </div>
    );
  };

  return (
    <div>
      <Title>Members</Title>
      <div className="members-page">
        {renderPermissionsTree()}
        <ModerationLog />
      </div>
      {canModify.length > 0 && (
        <div>
          <AddPermissionDialog />
          <RemovePermissionDialog />
        </div>
      )}
    </div>
  );
});
