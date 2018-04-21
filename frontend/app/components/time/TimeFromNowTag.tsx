import * as moment from 'moment-timezone';
import * as React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { ApplicationState } from '../../state/ApplicationState';
import { always } from 'ramda';
import { Icon, Intent, Tag, ITagProps } from '@blueprintjs/core';

type Props = {
  readonly time: moment.Moment;
  readonly hideSuffix?: boolean;
} & ITagProps;

type State = {
  readonly currentTime: moment.Moment;
};

type StateProps = {
  readonly offset: number;
};

class TimeFromNowComponent extends React.PureComponent<Props & StateProps, State> {
  state = {
    currentTime: moment.utc(),
  };

  private timerId: number;

  private update = (): void => this.setState({ currentTime: moment.utc() });

  public componentDidMount(): void {
    this.timerId = window.setInterval(this.update, 2000);
  }

  public componentWillUnmount(): void {
    window.clearInterval(this.timerId);
  }

  public render() {
    const now = this.state.currentTime.add(this.props.offset, 'milliseconds');
    const text = this.props.time.from(now, this.props.hideSuffix);

    let intent = Intent.SUCCESS;
    const diff = this.props.time.diff(now, 'minutes');

    if (diff < 0) {
      intent = Intent.WARNING;
    }

    if (diff < -30) {
      intent = Intent.DANGER;
    }

    return (
      <Tag {...this.props} intent={intent}>
        <Icon icon="time" /> {text}
      </Tag>
    );
  }
}

const stateSelector = createSelector<ApplicationState, number, StateProps>(
  state => state.timeSync.offset,
  offset => ({
    offset,
  }),
);

export const TimeFromNowTag: React.ComponentClass<Props> = connect<StateProps, {}, Props>(stateSelector, always({}))(
  TimeFromNowComponent,
);
