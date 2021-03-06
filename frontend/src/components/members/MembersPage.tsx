import { RouteComponentProps } from 'react-router';
import * as React from 'react';
import { Button, H2, Intent, NonIdealState, Spinner, Tree, TreeEventHandler } from '@blueprintjs/core';
import { BasicNode, LetterFolder, PermissionsState, UsernameNode } from '../../state/PermissionsState';
import { AddPermissionDialog } from './AddPermissionDialog';
import { RemovePermissionDialog } from './RemovePermissionDialog';
import { Title } from '../Title';
import { ModerationLog } from './ModerationLog';

export type MembersPageDispatchProps = {
  readonly fetchPermissionList: () => void;
  readonly expandPermissionNode: (permission: string) => void;
  readonly expandLetterNode: (permission: string, letter: string) => void;
  readonly collapsePermissionNode: (permission: string) => void;
  readonly collapseLetterNode: (permission: string, letter: string) => void;
  readonly openAddPermission: (perm: string) => void;
  readonly openRemovePermission: (perm: string, username: string) => void;
};

export type MembersPageStateProps = PermissionsState & {
  readonly canModify: string[];
};

export class MembersPage extends React.PureComponent<
  MembersPageStateProps & MembersPageDispatchProps & RouteComponentProps<any>
> {
  componentDidMount(): void {
    this.props.fetchPermissionList();
  }

  private canModify = (permission: string): boolean => this.props.canModify.indexOf(permission) >= 0;

  private onNodeClick: TreeEventHandler = n => {
    const node = n as BasicNode;

    if (!this.canModify(node.permission)) return;

    switch (node.type) {
      case 'permission':
        this.props.openAddPermission(node.permission);
        break;
      case 'username':
        this.props.openRemovePermission(node.permission, (node as UsernameNode).username);
    }
  };

  private collapseNode: TreeEventHandler = (n): void => {
    const node = n as BasicNode;

    switch (node.type) {
      case 'permission':
        this.props.collapsePermissionNode(node.permission);
        break;
      case 'letter':
        this.props.collapseLetterNode(node.permission, (node as LetterFolder).letter);
        break;
    }
  };

  private expandNode: TreeEventHandler = (n): void => {
    const node = n as BasicNode;

    switch (node.type) {
      case 'permission':
        this.props.expandPermissionNode(node.permission);
        break;
      case 'letter':
        this.props.expandLetterNode(node.permission, (node as LetterFolder).letter);
        break;
    }
  };

  private nodesWithClassNames = (): BasicNode[] =>
    this.props.nodes.map(node => {
      if (!this.canModify(node.permission)) return node;

      return {
        ...node,
        className: `${node.className} editable-permission-node`,
      };
    });

  private renderPermissionsTree = (): React.ReactElement => {
    if (this.props.isFetching) return <NonIdealState icon={<Spinner />} title="Loading..." />;

    return (
      <div className="permissions-tree">
        <H2>All members</H2>
        <Tree
          contents={this.nodesWithClassNames()}
          onNodeCollapse={this.collapseNode}
          onNodeExpand={this.expandNode}
          onNodeClick={this.onNodeClick}
        />
        <Button
          disabled={this.props.isFetching}
          onClick={this.props.fetchPermissionList}
          icon="refresh"
          intent={Intent.SUCCESS}
        >
          Refresh
        </Button>
      </div>
    );
  };

  public render() {
    return (
      <div>
        <Title>Members</Title>
        <div className="members-page">
          {this.renderPermissionsTree()}
          <ModerationLog />
        </div>
        {this.props.canModify.length > 0 && (
          <div>
            <AddPermissionDialog />
            <RemovePermissionDialog />
          </div>
        )}
      </div>
    );
  }
}
