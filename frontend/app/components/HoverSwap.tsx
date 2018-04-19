import { If } from './If';
import * as React from 'react';

type HoverSwapState = {
  readonly isHovered: boolean;
};

export class HoverSwap extends React.Component<{}, HoverSwapState> {
  state = {
    isHovered: false,
  };

  private handleMouseEnter = () => this.setState({ isHovered: true });

  private handleMouseLeave = () => this.setState({ isHovered: false });

  public render() {
    const [notHovered, hovered] = React.Children.toArray(this.props.children);

    return (
      <div onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
        <If condition={!this.state.isHovered}>{notHovered}</If>
        <If condition={this.state.isHovered}>{hovered}</If>
      </div>
    );
  }
}
