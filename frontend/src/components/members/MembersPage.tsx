import { Button, H2, Intent, NonIdealState, Spinner, Tree, type TreeEventHandler } from '@blueprintjs/core';
import { RefreshIcon } from '@blueprintjs/icons';
import { flatten, map } from 'ramda';
import { useCallback, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector, type Selector } from 'reselect';

import {
  AddPermission,
  FetchUserCountPerPermission,
  PermissionLetterNode,
  PermissionNode,
  RemovePermission,
} from '../../actions';
import type { ApplicationState } from '../../state/ApplicationState';
import type { NodeType, PermissionsState } from '../../state/PermissionsState';
import { getPermissions } from '../../state/Selectors';
import { Title } from '../Title';

import { AddPermissionDialog } from './AddPermissionDialog';
import { ModerationLog } from './ModerationLog';
import { RemovePermissionDialog } from './RemovePermissionDialog';

type MembersPageState = PermissionsState & {
  readonly canModify: string[];
};

const stateSelector: Selector<ApplicationState, MembersPageState> = createSelector(
  getPermissions,
  (state: ApplicationState) => state.permissions,
  (permissions, permissionState) => ({
    ...permissionState,
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    canModify: flatten(map(perm => permissionState.allowableModifications[perm] || [], permissions)),
  }),
);

export const MembersPage = () => {
  const { nodes, isFetching, canModify } = useSelector(stateSelector);
  const dispatch = useDispatch();

  const fetchPermissionList = useCallback(() => dispatch(FetchUserCountPerPermission.start()), [dispatch]);
  const openAddPermission = useCallback((perm: string) => dispatch(AddPermission.openDialog(perm)), [dispatch]);
  const openRemovePermission = useCallback(
    (permission: string, username: string) => dispatch(RemovePermission.openDialog({ username, permission })),
    [dispatch],
  );
  const expandPermissionNode = useCallback(
    (permission: string) => dispatch(PermissionNode.open(permission)),
    [dispatch],
  );
  const expandLetterNode = useCallback(
    (permission: string, letter: string) => dispatch(PermissionLetterNode.open({ permission, letter })),
    [dispatch],
  );
  const collapsePermissionNode = useCallback(
    (permission: string) => dispatch(PermissionNode.close(permission)),
    [dispatch],
  );
  const collapseLetterNode = useCallback(
    (permission: string, letter: string) => dispatch(PermissionLetterNode.close({ permission, letter })),
    [dispatch],
  );

  useEffect(() => {
    fetchPermissionList();
  }, [fetchPermissionList]);

  const canModifyFn = useCallback((permission: string): boolean => canModify.indexOf(permission) >= 0, [canModify]);

  const onNodeClick: TreeEventHandler<NodeType> = useCallback(
    (node): void => {
      if (!node.nodeData) return;

      if (!canModifyFn(node.nodeData.permission)) return;

      switch (node.nodeData.type) {
        case 'permission':
          openAddPermission(node.nodeData.permission);
          break;
        case 'username':
          openRemovePermission(node.nodeData.permission, node.nodeData.username);
      }
    },
    [canModifyFn, openAddPermission, openRemovePermission],
  );

  const collapseNode: TreeEventHandler<NodeType> = useCallback(
    (node): void => {
      if (!node.nodeData) return;

      switch (node.nodeData.type) {
        case 'permission':
          collapsePermissionNode(node.nodeData.permission);
          break;
        case 'letter':
          collapseLetterNode(node.nodeData.permission, node.nodeData.letter);
          break;
      }
    },
    [collapsePermissionNode, collapseLetterNode],
  );

  const expandNode: TreeEventHandler<NodeType> = useCallback(
    (node): void => {
      if (!node.nodeData) return;

      switch (node.nodeData.type) {
        case 'permission':
          expandPermissionNode(node.nodeData.permission);
          break;
        case 'letter':
          expandLetterNode(node.nodeData.permission, node.nodeData.letter);
          break;
      }
    },
    [expandPermissionNode, expandLetterNode],
  );

  const nodesWithClassNames = useMemo(
    () =>
      nodes.map(node => {
        if (!node.nodeData) return node;

        if (!canModifyFn(node.nodeData.permission)) return node;

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
        <Button disabled={isFetching} onClick={fetchPermissionList} icon={<RefreshIcon />} intent={Intent.SUCCESS}>
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
};
