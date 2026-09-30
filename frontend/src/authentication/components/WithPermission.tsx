import { useAtomValue } from 'jotai';
import React from 'react';

import { isLoggedInAtom, permissionsAtom } from '../atoms/authentication';

export type WithPermissionProps = {
  readonly permission: string | string[];
  readonly alternative?: React.ComponentType;
  readonly children: React.ReactNode;
};

export const WithPermission: React.FC<WithPermissionProps> = (props: WithPermissionProps) => {
  const { permission, alternative, children } = props;
  const toCheck = Array.isArray(permission) ? permission : [permission];
  const permissions = useAtomValue(permissionsAtom) ?? [];
  const isLoggedIn = useAtomValue(isLoggedInAtom);

  // empty array = check logged in, .some will require at least 1 to match
  const basicLoggedInCheck = permission.length === 0 && isLoggedIn;

  const show = basicLoggedInCheck || toCheck.some(p => permissions.includes(p));

  if (show) {
    return <>{children}</>;
  }

  if (alternative) {
    const Alt = alternative;

    return <Alt />;
  }

  return null;
};
