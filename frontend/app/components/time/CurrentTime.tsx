import * as React from 'react';
import * as moment from 'moment-timezone';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { ApplicationState } from '../../state/ApplicationState';
import { TimeSyncState } from '../../state/TimeSyncState';
import { memoize } from 'ramda';
import { Tooltip, Position } from '@blueprintjs/core';
import { getTimezone, is12hFormat } from '../../state/Selectors';
import { SyncTime } from '../../actions';

type State = {
  readonly time: moment.Moment;
};

type StateProps = {
  readonly timeSync: TimeSyncState;
  readonly timeFormat: string;
  readonly timezone: string;
};

type DispatchProps = {
  readonly resync: () => void;
};

class CurrentTimeComponent extends React.PureComponent<StateProps & DispatchProps, State> {
  state = {
    time: moment.utc(),
  };

  private timerId: number;

  constructor() {
    super();
    this.timerId = window.setInterval(this.update, 1000);
  }

  private update = (): void => this.setState({
    time: moment.utc(),
  })

  public componentWillUnmount(): void {
    window.clearInterval(this.timerId);
  }

  private formatOffset = memoize((offset: number): string => {
    let o = offset;
    const negative = o < 0;

    let output = '';

    if (negative) {
      output = '-';
      o *= -1;
    }

    if (o > 3600) {
      output += `${Math.floor(o / 3600)}h `;
      o %= 3600;
    }

    if (o > 60) {
      output += `${Math.floor(o / 60)}m `;
      o %= 60;
    }

    if (o > 0 || (o === 0 && (output === '' || output === '-'))) {
      output += `${o}s`;
    }

    return output.trim();
  });

  private tooltipText = (): string =>
    this.props.timeSync.synced
      ? `Synced with the server with ${this.formatOffset(this.props.timeSync.offset / 1000)} offset. Click to resync`
      : 'Not synced with the server'

  private timeText = () =>
    this.state.time
      .add(this.props.timeSync.offset, 'milliseconds')
      .clone()
      .tz(this.props.timezone)
      .format(this.props.timeFormat)

  render() {
    return (
      <Tooltip content={this.tooltipText()} position={Position.BOTTOM}>
        <span
          className={`current-time ${this.props.timeSync.synced ? '' : 'current-time-unsynced'}`}
          onClick={this.props.resync}
        >
          {this.timeText()}
        </span>
      </Tooltip>
    );
  }
}

const stateSelector = createSelector<ApplicationState, TimeSyncState, boolean, string, StateProps>(
  state => state.timeSync,
  is12hFormat,
  getTimezone,
  (timeSync, is12h, timezone) => ({
    timeSync,
    timezone,
    timeFormat: is12h ? 'hh:mm:ss A z' : 'HH:mm:ss z',
  }),
);

export const CurrentTime: React.ComponentClass = connect<StateProps, DispatchProps, {}>(
  stateSelector,
  (dispatch): DispatchProps => ({
    resync: () => dispatch(SyncTime.start()),
  }),
)(CurrentTimeComponent);
