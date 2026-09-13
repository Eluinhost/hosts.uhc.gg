import React from 'react';
import { Classes, Intent, Tag } from '@blueprintjs/core';

type Props = {
  readonly intent: Intent;
  readonly title: string;
  readonly items: string[];
  readonly icon?: React.ReactNode;
};

export const TagList: React.FC<Props> = ({ intent, icon, items }) => (
  <>
    {items.map((item, index) => (
      <Tag key={index} intent={intent} className={`${Classes.LARGE}`}>
        {icon} {item}
      </Tag>
    ))}
  </>
);
