import * as React from 'react';
import { connect } from 'react-redux';
import { ApplicationState } from '../state/ApplicationState';
import { matchesPermissions } from '../state/Selectors';
import { createSelector } from 'reselect';
import { memoizeWith, toString } from 'ramda';

type StateProps = {
  readonly show: boolean;
};

export type WithPermissionProps = {
  readonly permission: string | string[];
  readonly alternative?: React.ComponentType;
  readonly children: React.ReactNode;
};

const WithPermissionComponent: React.FunctionComponent<StateProps & WithPermissionProps> = ({
  show,
  alternative,
  children,
}) => {
  if (show) {
    return <>{children}</> || null;
  }

  if (alternative) {
    const Alt = alternative;

    return <Alt />;
  }

  return null;
};

const memoizedStateSelector = memoizeWith(toString, (perms: string | string[]) =>
  createSelector(matchesPermissions(perms), show => ({
    show,
  })),
);

export const WithPermission = connect<StateProps, {}, WithPermissionProps>(
  (state: ApplicationState, props?: WithPermissionProps): StateProps => memoizedStateSelector(props!.permission)(state),
)(WithPermissionComponent);
