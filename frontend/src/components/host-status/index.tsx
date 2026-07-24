import * as React from 'react';
import { Classes, Icon, Intent, Tag } from '@blueprintjs/core';

type HostStatusProps = {
  readonly roles: Array<string>;
};

export const HostStatus: React.FunctionComponent<HostStatusProps> = ({ roles }) => {
  if (roles.indexOf('host') !== -1) {
    return (
      <Tag intent={Intent.SUCCESS} className={`${Classes.LARGE}`} title="Verified Host">
        <Icon icon="tick-circle" /> Verified Host
      </Tag>
    );
  }

  if (roles.indexOf('trial host') !== -1) {
    return (
      <Tag intent={Intent.WARNING} className={`${Classes.LARGE}`} title="Trial Host">
        <Icon icon="person" /> Trial Host
      </Tag>
    );
  }

  return null;
};
