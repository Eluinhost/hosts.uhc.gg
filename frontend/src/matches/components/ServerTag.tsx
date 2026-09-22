import { Classes, Intent, Tag } from '@blueprintjs/core';
import React from 'react';

type Props = {
  readonly title: string;
  readonly text: string;
};

export const ServerTag: React.FC<Props> = ({ title, text }) => (
  <Tag intent={Intent.PRIMARY} className={Classes.MINIMAL} title={title}>
    {text}
  </Tag>
);
