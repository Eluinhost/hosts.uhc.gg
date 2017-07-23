import { Intent } from '@blueprintjs/core';
import * as React from 'react';

export const renderTagList = (intent: Intent, title: string, items: string[]) => items.map((item, index) =>
  <span className={`pt-tag pt-intent-${Intent[intent].toLowerCase()} pt-large`} title={title}>{item}</span>,
);
