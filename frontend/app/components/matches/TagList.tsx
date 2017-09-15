import { Icon, IconName, Intent } from '@blueprintjs/core';
import * as React from 'react';

export type TagListProps = {
  readonly intent: Intent;
  readonly title: string;
  readonly items: string[];
  readonly iconName?: IconName;
};

const renderItem = (intent: Intent, title: string, iconName?: IconName) => (item: string, index: number) => (
  <span
    key={index}
    className={`pt-tag pt-intent-${Intent[intent].toLowerCase()} pt-large`}
    title={title}
  >
    <Icon iconName={iconName}/> {item}
  </span>
);

export const TagList: React.SFC<TagListProps> = ({ intent, title, items, iconName }) => (
  <span>
    {items.map(renderItem(intent, title, iconName))}
  </span>
);
