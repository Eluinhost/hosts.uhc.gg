import * as React from 'react';
import * as moment from 'moment';
import * as momentTz from 'moment-timezone';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { ApplicationState } from '../../state/ApplicationState';
import { TimeSyncState } from '../../state/TimeSyncState';
import { memoize} from 'ramda';
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

const MILLIS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MILLIS_PER_MINUTE = MILLIS_PER_SECOND * SECONDS_PER_MINUTE;
const MINUTES_PER_HOUR = 60;
const MILLIS_PER_HOUR = MILLIS_PER_MINUTE * MINUTES_PER_HOUR;

class CurrentTimeComponent extends React.PureComponent<StateProps & DispatchProps, State> {
  state = {
    time: moment.utc(),
  };

  private timerId: number | null = null;

  private update = (): void =>
    this.setState({
      time: moment.utc(),
    });

  public componentDidMount(): void {
    window.setInterval(() => this.update(), 1000);
  }

  public componentWillUnmount(): void {
    if (this.timerId) {
      window.clearInterval(this.timerId);
    }
  }

  private formatOffset = memoize((offset: number): string => {
    let o = offset;
    const negative = o < 0;

    let output = '';

    if (negative) {
      output = '-';
      o *= -1;
    }

    if (o > MILLIS_PER_HOUR) {
      output += `${Math.floor(o / MILLIS_PER_HOUR)}h `;
      o %= MILLIS_PER_HOUR;
    }

    if (o > MILLIS_PER_MINUTE) {
      output += `${Math.floor(o / MILLIS_PER_MINUTE)}m `;
      o %= MILLIS_PER_MINUTE;
    }

    const display: number = offset < 10 * MILLIS_PER_SECOND ? o / MILLIS_PER_SECOND : Math.floor(o / MILLIS_PER_SECOND);

    output += `${display}s `;

    return output.trim();
  });

  private tooltipText = (): string =>
    this.props.timeSync.synced
      ? `Synced with the server with ${this.formatOffset(this.props.timeSync.offset)} offset. Click to resync`
      : 'Not synced with the server';

  private timeText = () =>
    (this.state.time
      .add(this.props.timeSync.offset, 'milliseconds')
      .clone() as momentTz.Moment)
      .tz(this.props.timezone)
      .format(this.props.timeFormat);

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
