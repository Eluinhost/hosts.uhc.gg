import { RouteComponentProps } from 'react-router';
import * as React from 'react';
import { map, sortBy, toLower, contains, toPairs, pipe, concat, toUpper, head, tail, converge } from 'ramda';
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
  readonly togglePermissionExpanded: (perm: string) => void;
  readonly openAddPermission: (perm: string) => () => void;
  readonly openRemovePermission: (perm: string, username: string) => () => void;
};

export type MembersPageStateProps = MembersState & {
  readonly canModify: string[];
};

const capitalise = (word: string): string => converge<string>(concat, [pipe(head, toUpper), tail])(word);

export class MembersPage
  extends React.Component<MembersPageStateProps & MembersPageDispatchProps & RouteComponentProps<any>> {
  componentDidMount(): void {
    this.props.fetchPermissionList();
    this.props.fetchModerationLog();
  }

  noOp = () => {};

  openRemoveDialog = (permission: string, username: string) => {
    if (this.props.canModify.indexOf(permission) === -1)
      return this.noOp;

    return this.props.openRemovePermission(permission, username);
  }

  openAddDialog = (permission: string) => {
    if (this.props.canModify.indexOf(permission) === -1)
      return this.noOp;

    return this.props.openAddPermission(permission);
  }

  generateMemberNode = (permission: string, username: string): ITreeNode => ({
    iconName: 'user',
    label: <span onClick={this.openRemoveDialog(permission, username)}>{username}</span>,
    className: this.props.canModify.indexOf(permission) > -1 ? 'permission-node' : '',
    id: `${permission}-${username}`,
  })

  generatePermissionNode = (permission: string, members: string[]): ITreeNode => ({
    iconName: 'folder-close',
    hasCaret: true,
    id: permission,
    className: this.props.canModify.indexOf(permission) > -1 ? 'permission-folder' : '',
    label: <span onClick={this.openAddDialog(permission)}>{capitalise(permission) + 's'}</span>,
    isExpanded: contains(permission, this.props.permissions.expandedPermissions),
    childNodes: pipe(
      sortBy(toLower),
      map<string, ITreeNode>(member => this.generateMemberNode(permission, member)),
    )(members),
  })

  generateTree = (): ITreeNode[] => pipe(
    toPairs as (p: PermissionsMap) => [string, string[]][],
    sortBy<[string, string[]]>(
      pipe(
        head,
        toLower,
      ),
    ),
    map(([permission, members]) => this.generatePermissionNode(permission, members)),
  )(this.props.permissions.permissions)

  onToggle = (node: ITreeNode): void => this.props.togglePermissionExpanded('' + node.id);

  RenderError: React.SFC<{ message: string }> = ({ message }) => (
    <div className="pt-callout pt-intent-danger"><h5>{message}</h5></div>
  )

  renderModLog = (): React.ReactElement<any>[] => map(
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

  renderPermissionsTree = (): React.ReactElement<any> => {
    if (this.props.permissions.fetching)
      return <NonIdealState visual={<Spinner/>} title="Loading..."/>;

    return (
      <div className="permissions-tree">
        <h2>All members</h2>
        <Tree contents={this.generateTree()} onNodeCollapse={this.onToggle} onNodeExpand={this.onToggle} />
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

  renderModerationLog = (): React.ReactElement<any> => {
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

  render() {
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
