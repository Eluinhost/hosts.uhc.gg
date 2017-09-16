import * as moment from 'moment';
import * as React from 'react';

type Props = {
  readonly time: moment.Moment;
  readonly updateInterval: number;
  readonly hideSuffix?: boolean;
};

type State = {
  readonly text: string;
};

export class FromNow extends React.Component<Props, State> {
  state = {
    text: '',
  };

  private timerId: number;

  private update = (): void => {
    this.setState({
      text: this.props.time.fromNow(this.props.hideSuffix),
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
