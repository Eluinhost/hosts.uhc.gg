import { Classes, Icon, IconName, Intent, Tag } from '@blueprintjs/core';
import * as React from 'react';

type Props = {
  readonly intent: Intent;
  readonly title: string;
  readonly items: string[];
  readonly icon?: IconName;
};

export class TagList extends React.PureComponent<Props> {
  private renderItem = (item: string, index: number): React.ReactElement<any> => (
    <Tag key={index} intent={this.props.intent} className={`${Classes.LARGE}`}>
      <Icon icon={this.props.icon} /> {item}
    </Tag>
  );

  public render() {
    return <>{this.props.items.map(this.renderItem)}</>;
  }
}
