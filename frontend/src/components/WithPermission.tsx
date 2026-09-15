import { memoizeWith, toString } from 'ramda';
import React from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import { matchesPermissions } from '../state/Selectors';

export type WithPermissionProps = {
  readonly permission: string | string[];
  readonly alternative?: React.ComponentType;
  readonly children: React.ReactNode;
};

const memoizedStateSelector = memoizeWith(toString, (perms: string | string[]) =>
  createSelector(matchesPermissions(perms), show => ({
    show,
  })),
);

export const WithPermission: React.FC<WithPermissionProps> = (props: WithPermissionProps) => {
  const { permission, alternative, children } = props;
  const { show } = useSelector(state => memoizedStateSelector(permission)(state));

  if (show) {
    return <>{children}</>;
  }

  if (alternative) {
    const Alt = alternative;

    return <Alt />;
  }

  return null;
};
