import { Badge } from '@mantine/core';
import { UserIcon, CheckCircleIcon } from '@phosphor-icons/react';
import React from 'react';

interface HostStatusProps {
  // matches returned by the conflicts endpoint historically had no roles, so this can be undefined
  roles?: Array<string>;
}

export const HostStatus: React.FC<HostStatusProps> = ({ roles = [] }) => {
  if (roles.indexOf('host') !== -1) {
    return (
      <Badge bdrs="sm" color="green" size="lg" title="Verified Host" leftSection={<CheckCircleIcon />}>
        Verified Host
      </Badge>
    );
  }

  if (roles.indexOf('trial host') !== -1) {
    return (
      <Badge bdrs="sm" color="yellow" size="lg" title="Trial Host" leftSection={<UserIcon />}>
        Trial Host
      </Badge>
    );
  }

  return null;
};
