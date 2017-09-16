import * as moment from 'moment';
import * as React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { ApplicationState } from '../state/ApplicationState';
import { always } from 'ramda';
import { Icon, Intent, Tag, ITagProps } from '@blueprintjs/core';

type Props = {
  readonly time: moment.Moment;
  readonly updateInterval: number;
  readonly hideSuffix?: boolean;
} & ITagProps;

type State = {
  readonly text: string;
  readonly intent: Intent;
};

type StateProps = {
  readonly offset: number;
};

class TimeFromNowComponent extends React.Component<Props & StateProps, State> {
  state = {
    text: '',
    intent: Intent.SUCCESS,
  };

  private timerId: number;

  private update = (): void => {
    const now = moment.utc().add(this.props.offset, 'milliseconds');
    const text = this.props.time.from(now, this.props.hideSuffix);

    let intent = Intent.SUCCESS;
    const diff = this.props.time.diff(now, 'minutes');

    if (diff < 0) {
      intent = Intent.WARNING;
    }

    if (diff < -30) {
      intent = Intent.DANGER;
    }

    this.setState({
      text,
      intent,
    });
  }

  public componentDidMount(): void {
    this.timerId = window.setInterval(this.update, this.props.updateInterval);
    this.update();
  }

  public componentWillUnmount(): void {
    window.clearInterval(this.timerId);
  }

  public render() {
    return (
      <Tag {...this.props} intent={this.state.intent}>
        <Icon iconName="time" /> {this.state.text}
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

export const TimeFromNowTag: React.ComponentClass<Props> = connect<StateProps, {}, Props>(
  stateSelector,
  always({}),
)(TimeFromNowComponent);
