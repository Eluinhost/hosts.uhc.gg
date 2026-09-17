import { Classes, Intent, Tag } from '@blueprintjs/core';
import { PersonIcon, TickCircleIcon } from '@blueprintjs/icons';
import React from 'react';

type HostStatusProps = {
  // matches returned by the conflicts endpoint historically had no roles, so this can be undefined
  readonly roles?: Array<string>;
};

export const HostStatus: React.FC<HostStatusProps> = ({ roles = [] }) => {
  if (roles.indexOf('host') !== -1) {
    return (
      <Tag intent={Intent.SUCCESS} className={Classes.LARGE} title="Verified Host">
        <TickCircleIcon /> Verified Host
      </Tag>
    );
  }

  if (roles.indexOf('trial host') !== -1) {
    return (
      <Tag intent={Intent.WARNING} className={Classes.LARGE} title="Trial Host">
        <PersonIcon /> Trial Host
      </Tag>
    );
  }

  return null;
};
