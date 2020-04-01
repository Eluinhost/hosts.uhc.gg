import * as React from 'react';

type HoverSwapState = {
  readonly isHovered: boolean;
};

export class HoverSwap extends React.PureComponent<{}, HoverSwapState> {
  state = {
    isHovered: false,
  };

  private handleMouseEnter = () => this.setState({ isHovered: true });

  private handleMouseLeave = () => this.setState({ isHovered: false });

  public render() {
    const [notHovered, hovered] = React.Children.toArray(this.props.children);

    return (
      <div onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
        {this.state.isHovered ? hovered : notHovered}
      </div>
    );
  }
}
