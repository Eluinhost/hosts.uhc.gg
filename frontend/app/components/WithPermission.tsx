import * as React from 'react';
import { connect } from 'react-redux';
import { ApplicationState } from '../state/ApplicationState';
import {
  when, complement, intersection, curry, length, pipe, CurriedFunction2, ifElse, isEmpty, T, equals,
} from 'ramda';
import { If } from './If';

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

const validPermissions: CurriedFunction2<string[], string | string[], boolean> =
  curry((has: string[], needs: string | string[]) => ifElse(
    isEmpty,
    T, // if it's empty always return true
    pipe(
      when(complement(Array.isArray), Array.of), // convert to array if needed
      intersection(has),
      length,
      complement(equals(0)),
    ),
  )(needs));

export const WithPermission = connect<StateProps, {}, WithPermissionProps>(
  (state: ApplicationState, props: WithPermissionProps): StateProps => ({
    show: state.authentication.loggedIn && validPermissions(
      state.authentication.data!.accessTokenClaims.permissions,
      props.permission,
    ),
  }),
)(WithPermissionComponent);
