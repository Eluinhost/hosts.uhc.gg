import { RouteComponentProps } from 'react-router';
import * as React from 'react';
import { map, sortBy, toLower, contains, toPairs, compose, nth, join, toUpper, head, tail, juxt } from 'ramda';
import { Button, Intent, ITreeNode, NonIdealState, Spinner, Tree, Tag } from '@blueprintjs/core';
import { MembersState } from '../../state/MembersState';
import { ModLogEntry } from '../../ModLogEntry';
import { AddPermissionDialog } from './AddPermissionDialog';
import { RemovePermissionDialog } from './RemovePermissionDialog';

export type MembersPageDispatchProps = {
  readonly fetchPermissionList: () => void;
  readonly fetchModerationLog: () => void;
  readonly togglePermissionExpanded: (perm: string) => void;
  readonly openAddPermission: (perm: string) => () => void;
  readonly openRemovePermission: (perm: string, username: string) => () => void;
};

export type MembersPageStateProps = MembersState & {
  readonly canModify: boolean;
};

const capitalise = compose(
  join(''),
  juxt([compose(toUpper, head), tail]),
);

export class MembersPage
  extends React.Component<MembersPageStateProps & MembersPageDispatchProps & RouteComponentProps<any>> {
  componentDidMount() {
    this.props.fetchPermissionList();
    this.props.fetchModerationLog();
  }

  generateMemberNode = (permission: string, username: string): ITreeNode => ({
    iconName: 'user',
    label: <span onClick={this.props.openRemovePermission(permission, username)}>{username}</span>,
    className: this.props.canModify ? 'permission-node' : '',
    id: `${permission}-${username}`,
  })

  generatePermissionNode = (permission: string, members: string[]): ITreeNode => ({
    iconName: 'folder-close',
    hasCaret: true,
    id: permission,
    className: this.props.canModify ? 'permission-folder' : '',
    label: <span onClick={this.props.openAddPermission(permission)}>{capitalise(permission) + 's'}</span>,
    isExpanded: contains(permission, this.props.permissions.expandedPermissions),
    childNodes: compose(
      map<string, ITreeNode>(member => this.generateMemberNode(permission, member)),
      sortBy(toLower),
    )(members),
  })

  generateTree = (): ITreeNode[] => compose(
    map<[string, string[]], ITreeNode>(([permission, members]) =>
      this.generatePermissionNode(permission, members),
    ), // map each entry to a tree node
    sortBy(compose(toLower, nth(0))), // sort by permission name lower case
    toPairs, // convert into [key, value][]
  )(this.props.permissions.permissions)

  onToggle = (node: ITreeNode): void => this.props.togglePermissionExpanded('' + node.id);

  RenderError: React.SFC<{ message: string}> = ({ message }) => (
    <div className="pt-callout pt-intent-danger"><h5>{message}</h5></div>
  )

  renderModLog = (): React.ReactElement<any>[] => map<ModLogEntry, React.ReactElement<any>>(
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
  )(this.props.moderationLog.log)

  renderPermissionsTree = (): React.ReactElement<any> => {
    if (this.props.permissions.fetching)
      return <NonIdealState visual={<Spinner/>} title="Loading..."/>;

    return (
      <div className="permissions-tree">
        <h2>All members</h2>
        <Tree contents={this.generateTree()} onNodeCollapse={this.onToggle} onNodeExpand={this.onToggle} />
        {this.props.permissions.error && <this.RenderError message={this.props.permissions.error} />}
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
        {this.props.moderationLog.error && <this.RenderError message={this.props.moderationLog.error} />}
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
        <div className="members-page">
          {this.renderPermissionsTree()}
          {this.renderModerationLog()}
        </div>
        {this.props.canModify && <div><AddPermissionDialog /><RemovePermissionDialog /></div>}
      </div>
    );
  }
}
