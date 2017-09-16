import * as React from 'react';
import * as moment from 'moment';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { ApplicationState } from '../state/ApplicationState';
import { TimeSyncState } from '../state/TimeSyncState';
import { identity, always, memoize } from 'ramda';
import { Tooltip, Position } from '@blueprintjs/core';

type State = {
  readonly text: string;
};

type Props = TimeSyncState;

class CurrentTimeComponent extends React.Component<Props, State> {
  state = {
    text: '',
  };

  private timerId: number;

  private update = (): void => this.setState({
    text: moment.utc().add(this.props.offset, 'milliseconds').format('HH:mm:ss'),
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

    if (offset > 3600) {
      output += `${Math.floor(offset / 3600)}h `;
      o %= 3600;
    }

    if (offset > 60) {
      output += `${Math.floor(offset / 60)}m `;
      o %= 60;
    }

    if (o > 0 || (o === 0 && (output === '' || output === '-'))) {
      output += `${o}s`;
    }

    return output.trim();
  });

  private tooltipText = (): string =>
    this.props.synced
      ? `Synced with the server with ${this.formatOffset(this.props.offset / 1000)} offset`
      : 'Not synced with the server'

  render() {
    return (
      <Tooltip content={this.tooltipText()} position={Position.BOTTOM}>
        <span className={`current-time ${this.props.synced ? '' : 'current-time-unsynced'}`}>{this.state.text}</span>
      </Tooltip>
    );
  }
}

const stateSelector = createSelector<ApplicationState, Props, Props>(
  state => state.timeSync,
  identity,
);

export const CurrentTime: React.ComponentClass = connect<Props, {}, {}>(
  stateSelector,
  always({}),
)(CurrentTimeComponent);
