import { BanEntry } from '../../BanEntry';
import * as React from 'react';
import { Intent, Tag } from '@blueprintjs/core';

export const BanHistoryEntry: React.SFC<BanEntry> = ({ reason, created, expires, link, createdBy }) => (
  <div
    className={`pt-card match-row pt-interactive`}
  >
    <div>
      <Tag intent={Intent.SUCCESS} title="Created">
        {created.format('Do MMMM, YYYY')}
      </Tag>
      <span> → </span>
      <Tag intent={Intent.SUCCESS} title="Expires">
        {expires.format('Do MMMM, YYYY')}
      </Tag>
      <span> | </span>
      <a href={link} target="_blank">
        <Tag intent={Intent.PRIMARY}>
          Case Link
        </Tag>
      </a>
    </div>
    <pre>
      <em>{reason}</em>
      <span> - /u/{createdBy}</span>
    </pre>
  </div>
);
