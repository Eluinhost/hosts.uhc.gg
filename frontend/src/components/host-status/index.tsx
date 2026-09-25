import { Classes, Intent, Tag } from '@blueprintjs/core';
import { UserIcon, CheckCircleIcon } from '@phosphor-icons/react';
import React from 'react';

type HostStatusProps = {
  // matches returned by the conflicts endpoint historically had no roles, so this can be undefined
  readonly roles?: Array<string>;
};

export const HostStatus: React.FC<HostStatusProps> = ({ roles = [] }) => {
  if (roles.indexOf('host') !== -1) {
    return (
      <Tag intent={Intent.SUCCESS} className={Classes.LARGE} title="Verified Host">
        <CheckCircleIcon /> Verified Host
      </Tag>
    );
  }

  if (roles.indexOf('trial host') !== -1) {
    return (
      <Tag intent={Intent.WARNING} className={Classes.LARGE} title="Trial Host">
        <UserIcon /> Trial Host
      </Tag>
    );
  }

  return null;
};
