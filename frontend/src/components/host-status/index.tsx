import * as React from 'react';
import { Classes, Icon, Intent, Tag } from '@blueprintjs/core';
import { fetchPermissionsForUser } from '../../api/Permissions';

const permissionRequests = new Map<string, Promise<string[]>>();

const permissionsFor = (username: string): Promise<string[]> => {
  const existing = permissionRequests.get(username);
  if (existing) return existing;

  const request = fetchPermissionsForUser(username).catch(() => []);
  permissionRequests.set(username, request);
  return request;
};

type HostStatusProps = {
  readonly username: string;
};

export const HostStatus: React.FunctionComponent<HostStatusProps> = ({ username }) => {
  const [permissions, setPermissions] = React.useState<string[] | null>(null);

  React.useEffect(() => {
    let mounted = true;

    permissionsFor(username).then(result => {
      if (mounted) setPermissions(result);
    });

    return () => {
      mounted = false;
    };
  }, [username]);

  if (!permissions) return null;

  if (permissions.indexOf('host') !== -1) {
    return (
      <Tag intent={Intent.SUCCESS} className={`${Classes.LARGE}`} title="Verified Host">
        <Icon icon="tick-circle" /> Verified Host
      </Tag>
    );
  }

  if (permissions.indexOf('trial host') !== -1) {
    return (
      <Tag intent={Intent.WARNING} className={`${Classes.LARGE}`} title="Trial Host">
        <Icon icon="person" /> Trial Host
      </Tag>
    );
  }

  return null;
};