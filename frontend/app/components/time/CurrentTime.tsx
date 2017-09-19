import * as React from 'react';
import * as moment from 'moment-timezone';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { ApplicationState } from '../../state/ApplicationState';
import { TimeSyncState } from '../../state/TimeSyncState';
import { always, memoize } from 'ramda';
import { Tooltip, Position } from '@blueprintjs/core';

type State = {
  readonly text: string;
};

type StateProps = {
  readonly timeSync: TimeSyncState;
  readonly timeFormat: string;
};

class CurrentTimeComponent extends React.Component<StateProps, State> {
  state = {
    text: '',
  };

  private timerId: number;

  private update = (): void => this.setState({
    text: moment.utc().add(this.props.timeSync.offset, 'milliseconds').format(this.props.timeFormat),
  })

  public componentWillMount(): void {
    this.timerId = window.setInterval(this.update, 1000);
    this.update();
  }

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
      ? `Synced with the server with ${this.formatOffset(this.props.timeSync.offset / 1000)} offset`
      : 'Not synced with the server'

  render() {
    return (
      <Tooltip content={this.tooltipText()} position={Position.BOTTOM}>
        <span className={`current-time ${this.props.timeSync.synced ? '' : 'current-time-unsynced'}`}>
          {this.state.text}
        </span>
      </Tooltip>
    );
  }
}

const stateSelector = createSelector<ApplicationState, TimeSyncState, boolean, StateProps>(
  state => state.timeSync,
  state => state.settings.is12h,
  (timeSync, is12h) => ({
    timeSync,
    timeFormat: is12h ? 'hh:mm:ss A' : 'HH:mm:ss',
  }),
);

export const CurrentTime: React.ComponentClass = connect<StateProps, {}, {}>(
  stateSelector,
  always({}),
)(CurrentTimeComponent);
