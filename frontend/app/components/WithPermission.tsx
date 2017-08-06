import * as React from 'react';
import { connect } from 'react-redux';
import { ApplicationState } from '../state/ApplicationState';
import { If } from './If';
import { matchesPermissions } from '../state/Selectors';
import { createSelector } from 'reselect';
import { memoize } from 'ramda';

type StateProps = {
  readonly show: boolean;
};

export type WithPermissionProps = {
  readonly permission: string | string[];
  readonly alternative?: React.ComponentType;
};

const WithPermissionComponent: React.SFC<StateProps & WithPermissionProps> =
  ({ show, alternative, children }) => {
    return <If predicate={show} alternative={alternative}>{children}</If>;
  };

const memoizedStateSelector = memoize(
  (perms: string | string[]) => createSelector(
    matchesPermissions(perms),
    show => ({
      show,
    }),
  ),
);

export const WithPermission = connect<StateProps, {}, WithPermissionProps>(
  (state: ApplicationState, props: WithPermissionProps): StateProps => memoizedStateSelector(props.permission)(state),
)(WithPermissionComponent);
