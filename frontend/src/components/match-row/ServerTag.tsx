import * as React from 'react';
import { Classes, Intent, Tag } from '@blueprintjs/core';

type Props = {
  readonly title: string;
  readonly text: string;
};

export class ServerTag extends React.PureComponent<Props> {
  public render() {
    return (
      <Tag intent={Intent.PRIMARY} className={`${Classes.MINIMAL}`} title={this.props.title}>
        {this.props.text}
      </Tag>
    );
  }
}
