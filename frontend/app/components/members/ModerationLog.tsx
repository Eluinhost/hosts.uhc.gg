import * as React from 'react';
import { PermissionModerationLogState } from '../../state/PermissionModerationLogState';
import { PermissionModerationLogEntry } from '../../models/PermissionModerationLogEntry';
import { Button, Classes, Icon, Intent, NonIdealState, Spinner, Tag } from '@blueprintjs/core';
import { MatchOpens } from '../time/MatchOpens';
import { If } from '../If';
import { connect, Dispatch } from 'react-redux';
import { createSelector } from 'reselect';
import { ApplicationState } from '../../state/ApplicationState';
import { RefreshPermissionModerationLog } from '../../actions';

type StateProps = PermissionModerationLogState;

type DispatchProps = {
  readonly refresh: () => void;
};

class ModerationLogComponent extends React.PureComponent<StateProps & DispatchProps> {
  public componentDidMount() {
    this.props.refresh();
  }

  private renderRow = (row: PermissionModerationLogEntry, index: number) => (
    <Tag
      key={row.id}
      className={`${Classes.LARGE} moderation-log-entry`}
      intent={row.added ? Intent.SUCCESS : Intent.DANGER}
      title={`Actioned by ${row.modifier}`}
    >
      <span className="pt-monospace-text">
        <MatchOpens time={row.at}/>
      </span>
      <Icon iconName={row.added ? 'add' : 'remove'}/>
      <span>{row.permission}</span>
      <span className="moderation-log-entry-affected">/u/{row.username}</span>
    </Tag>
  )

  public render() {
    if (this.props.fetching)
      return <NonIdealState visual={<Spinner/>} title="Loading..."/>;

    return (
      <div className="moderation-log">
        <h2>Moderation Log</h2>
        {this.props.log.map(this.renderRow)}
        <If condition={!!this.props.error}>
          <div className={`${Classes.CALLOUT} ${Classes.INTENT_DANGER}`}>
            <h5>{this.props.error}</h5>
          </div>
        </If>
        <Button
          disabled={this.props.fetching}
          onClick={this.props.refresh}
          iconName="refresh"
          intent={Intent.SUCCESS}
        >
          Refresh
        </Button>
      </div>
    );
  }
}

const stateSelector = createSelector<ApplicationState, PermissionModerationLogState, StateProps>(
  state => state.permissionModerationLog,
  it => it,
);

const dispatch = (dispatch: Dispatch<ApplicationState>): DispatchProps => ({
  refresh: () => dispatch(RefreshPermissionModerationLog.start()),
});

export const ModerationLog: React.ComponentClass = connect<StateProps, DispatchProps, {}>(
  stateSelector,
  dispatch,
)(ModerationLogComponent);
