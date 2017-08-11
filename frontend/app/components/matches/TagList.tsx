import { Intent } from '@blueprintjs/core';
import * as React from 'react';

export type TagListProps = {
  readonly intent: Intent;
  readonly title: string;
  readonly items: string[];
};

const renderItem = (intent: Intent, title: string) => (item: string, index: number) => (
  <span
    key={index}
    className={`pt-tag pt-intent-${Intent[intent].toLowerCase()} pt-large`}
    title={title}
  >
      {item}
  </span>
);

export const TagList: React.SFC<TagListProps> = ({ intent, title, items }) => (
  <span>
    {items.map(renderItem(intent, title))}
  </span>
);
