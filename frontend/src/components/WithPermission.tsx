import { useAtomValue } from 'jotai';
import React from 'react';

import { permissionsAtom } from '../atoms/authentication';

export type WithPermissionProps = {
  readonly permission: string | string[];
  readonly alternative?: React.ComponentType;
  readonly children: React.ReactNode;
};

export const WithPermission: React.FC<WithPermissionProps> = (props: WithPermissionProps) => {
  const { permission, alternative, children } = props;
  const toCheck = Array.isArray(permission) ? permission : [permission];
  const permissions = useAtomValue(permissionsAtom) ?? [];

  const show = toCheck.some(p => permissions.includes(p));

  if (show) {
    return <>{children}</>;
  }

  if (alternative) {
    const Alt = alternative;

    return <Alt />;
  }

  return null;
};
