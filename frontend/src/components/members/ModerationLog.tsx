import * as React from 'react';
import { PermissionModerationLogState } from '../../state/PermissionModerationLogState';
import { PermissionModerationLogEntry } from '../../models/PermissionModerationLogEntry';
import { Button, Callout, Classes, H2, H5, Intent, NonIdealState, Spinner } from "@blueprintjs/core";
import { MatchOpens } from '../time/MatchOpens';
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

  private renderRow = (row: PermissionModerationLogEntry) => (
    <Callout
      key={row.id}
      className={`moderation-log-entry ${Classes.MONOSPACE_TEXT}`}
      intent={row.added ? Intent.SUCCESS : Intent.DANGER}
      title={`${row.permission} /u/${row.username}`}
      icon={row.added ? 'add' : 'remove'}
    >
      Actioned by {row.modifier} @ <MatchOpens time={row.at} />
    </Callout>
  );

  public render() {
    if (this.props.fetching) return <NonIdealState icon={<Spinner />} title="Loading..." />;

    return (
      <div className="moderation-log">
        <H2>Moderation Log</H2>
        {this.props.log.map(this.renderRow)}
        {!!this.props.error && (
          <div className={`${Classes.CALLOUT} ${Classes.INTENT_DANGER}`}>
            <H5>{this.props.error}</H5>
          </div>
        )}
        <Button disabled={this.props.fetching} onClick={this.props.refresh} icon="refresh" intent={Intent.SUCCESS}>
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

export const ModerationLog: React.ComponentClass = connect<StateProps, DispatchProps, {}>(stateSelector, dispatch)(
  ModerationLogComponent,
);
