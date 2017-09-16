import * as moment from 'moment';
import * as React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { ApplicationState } from '../state/ApplicationState';
import { always } from 'ramda';

type Props = {
  readonly time: moment.Moment;
  readonly updateInterval: number;
  readonly hideSuffix?: boolean;
};

type State = {
  readonly text: string;
};

type StateProps = {
  readonly offset: number;
};

class FromNowComponent extends React.Component<Props & StateProps, State> {
  state = {
    text: '',
  };

  private timerId: number;

  private update = (): void => {
    this.setState({
      text: this.props.time.from(moment.utc().add(this.props.offset, 'milliseconds'), this.props.hideSuffix),
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
    return <span>{this.state.text}</span>;
  }
}

const stateSelector = createSelector<ApplicationState, number, StateProps>(
  state => state.timeSync.offset,
  offset => ({
    offset,
  }),
);

export const FromNow: React.ComponentClass<Props> = connect<StateProps, {}, Props>(
  stateSelector,
  always({}),
)(FromNowComponent);
