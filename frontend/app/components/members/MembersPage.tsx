import { RouteComponentProps } from 'react-router';
import * as React from 'react';
import {
  map, sortBy, toLower, contains, toPairs, pipe, concat,
  toUpper, head, tail, converge, groupBy, Obj, unless, chain, prop,
} from 'ramda';
import { Button, Intent, ITreeNode, NonIdealState, Spinner, Tree, Tag } from '@blueprintjs/core';
import { MembersState } from '../../state/MembersState';
import { AddPermissionDialog } from './AddPermissionDialog';
import { RemovePermissionDialog } from './RemovePermissionDialog';
import { PermissionsMap } from '../../PermissionsMap';
import { If } from '../If';
import { Title } from '../Title';

export type MembersPageDispatchProps = {
  readonly fetchPermissionList: () => void;
  readonly fetchModerationLog: () => void;
  readonly toggleNodeExpanded: (perm: string) => void;
  readonly openAddPermission: (perm: string) => void;
  readonly openRemovePermission: (perm: string, username: string) => void;
};

export type MembersPageStateProps = MembersState & {
  readonly canModify: string[];
};

const capitalise = (word: string): string => converge<string>(concat, [pipe(head, toUpper), tail])(word);

interface PermissionTreeNode extends ITreeNode {
  readonly type: 'permission folder' | 'alpha folder' | 'username';
  readonly permission: string;
}

interface UsernameTreeNode extends PermissionTreeNode {
  readonly username: string;
}

export class MembersPage
  extends React.Component<MembersPageStateProps & MembersPageDispatchProps & RouteComponentProps<any>> {
  componentDidMount(): void {
    this.props.fetchPermissionList();
    this.props.fetchModerationLog();
  }

  private canModify = (permission: string): boolean => this.props.canModify.indexOf(permission) >= 0;

  private createUsernameNode = (permission: string, username: string): UsernameTreeNode => ({
    username,
    permission,
    type: 'username',
    iconName: 'user',
    label: username,
    className: this.canModify(permission) ? 'permission-node' : '',
    id: `username-${permission}-${username}`,
  })

  private headChar = (s: string): string => s.charAt(0).toUpperCase();

  private shouldGroup = (items: PermissionTreeNode[]): boolean => items.length > 20;

  private createAlphaNumericFolders = (permission: string, members: string[]): PermissionTreeNode[] => pipe<
    string[],
    Obj<string[]>,
    Obj<UsernameTreeNode[]>,
    [string, UsernameTreeNode[]][],
    [string, UsernameTreeNode[]][],
    PermissionTreeNode[]
  >(
    groupBy<string>(this.headChar), // map[first char, members]
    map<string[], UsernameTreeNode[]>(
      map<string, UsernameTreeNode>(member => this.createUsernameNode(permission, member)),
    ), // map[string[], UsernameTreeNode[]]
    toPairs, // array[[first char, treenodes]]
    sortBy<[string, UsernameTreeNode[]]>(head),
    map<[string, UsernameTreeNode[]], PermissionTreeNode>(([char, memberNodes]): PermissionTreeNode => ({
      permission,
      id: `alpha-${char}-${permission}`,
      type: 'alpha folder',
      label: char,
      hasCaret: true,
      isExpanded: contains(`alpha-${char}-${permission}`, this.props.permissions.expandedNodes),
      childNodes: memberNodes,
    })),
  )(members)

  private createPermissionFolderNode = (permission: string, members: string[]): PermissionTreeNode => ({
    permission,
    type: 'permission folder',
    iconName: 'folder-close',
    hasCaret: true,
    id: `permission-${permission}`,
    className: this.canModify(permission) ? 'permission-folder' : '',
    label: capitalise(permission) + 's',
    isExpanded: contains(`permission-${permission}`, this.props.permissions.expandedNodes),
    childNodes: unless<PermissionTreeNode[], PermissionTreeNode[]>(
      this.shouldGroup, // Remove nested alpha when there is no need to use it
      chain<PermissionTreeNode, PermissionTreeNode>(prop('childNodes')),
    )(this.createAlphaNumericFolders(permission, members)),
  })

  private generateTree = (): PermissionTreeNode[] => pipe(
    toPairs as (p: PermissionsMap) => [string, string[]][],
    sortBy<[string, string[]]>(
      pipe(
        head,
        toLower,
      ),
    ),
    map(([permission, members]) => this.createPermissionFolderNode(permission, members)),
  )(this.props.permissions.permissions)

  private onNodeClick = (node: ITreeNode) => {
    const permissionNode = node as PermissionTreeNode;

    if (!this.canModify(permissionNode.permission))
      return;

    if (permissionNode.type === 'permission folder') {
      this.props.openAddPermission(permissionNode.permission);
    } else if (permissionNode.type === 'username') {
      this.props.openRemovePermission(permissionNode.permission, (permissionNode as UsernameTreeNode).username);
    }
  }

  private onToggle = (node: ITreeNode): void => this.props.toggleNodeExpanded(node.id as string);

  RenderError: React.SFC<{ message: string }> = ({ message }) => (
    <div className="pt-callout pt-intent-danger"><h5>{message}</h5></div>
  )

  private renderModLog = (): React.ReactElement<any>[] => map(
    entry => (
      <Tag
        key={entry.id}
        className="pt-large moderation-log-entry"
        intent={entry.added ? Intent.SUCCESS : Intent.DANGER}
        title={`Actioned by ${entry.modifier}`}
      >
        <span className="pt-monospace-text">{entry.at.format('MMM Do HH:mm')}</span>
        <span className={`pt-icon pt-icon-${entry.added ? 'add' : 'remove'}`}/>
        <span>{entry.permission}</span>
        <span className="moderation-log-entry-affected">/u/{entry.username}</span>
      </Tag>
    ),
    this.props.moderationLog.log,
  )

  private renderPermissionsTree = (): React.ReactElement<any> => {
    if (this.props.permissions.fetching)
      return <NonIdealState visual={<Spinner/>} title="Loading..."/>;

    return (
      <div className="permissions-tree">
        <h2>All members</h2>
        <Tree
          contents={this.generateTree()}
          onNodeCollapse={this.onToggle}
          onNodeExpand={this.onToggle}
          onNodeClick={this.onNodeClick}
        />
        <If condition={!!this.props.permissions.error}>
          <this.RenderError message={this.props.permissions.error!} />
        </If>
        <Button
          disabled={this.props.permissions.fetching}
          onClick={this.props.fetchPermissionList}
          iconName="refresh"
          intent={Intent.SUCCESS}
        >
          Refresh
        </Button>
      </div>
    );
  }

  private renderModerationLog = (): React.ReactElement<any> => {
    if (this.props.moderationLog.fetching)
      return <NonIdealState visual={<Spinner/>} title="Loading..."/>;

    return (
      <div className="moderation-log">
        <h2>Moderation Log</h2>
        {this.renderModLog()}
        <If condition={!!this.props.moderationLog.error}>
          <this.RenderError message={this.props.moderationLog.error!} />
        </If>
        <Button
          disabled={this.props.moderationLog.fetching}
          onClick={this.props.fetchModerationLog}
          iconName="refresh"
          intent={Intent.SUCCESS}
        >
          Refresh
        </Button>
      </div>
    );
  }

  public render() {
    return (
      <div>
        <Title>Members</Title>
        <div className="members-page">
          {this.renderPermissionsTree()}
          {this.renderModerationLog()}
        </div>
        <If condition={this.props.canModify.length > 0}>
          <div>
            <AddPermissionDialog />
            <RemovePermissionDialog />
          </div>
        </If>
      </div>
    );
  }
}
