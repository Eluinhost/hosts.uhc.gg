import { Redirect, RouteComponentProps } from 'react-router';
import * as React from 'react';
import { AuthenticationData, login as loginAction, parseJwt } from '../state/AuthenticationState';
import { connect } from 'react-redux';
import { NonIdealState } from '@blueprintjs/core';

export type LoginPageParams = {
  readonly token: string;
};

export type LoginPageDispatchProps = {
  readonly login: (data: AuthenticationData) => any;
};

const InvalidToken: React.SFC = () => <NonIdealState title="Invalid login token" visual="warning" />;

export const LoginPageComponent: React.SFC<RouteComponentProps<LoginPageParams> & LoginPageDispatchProps> =
  ({ match, login }) => {
    const fixed = match.params.token.replace(/-/g, '.');

    try {
      const claims = parseJwt(fixed);

      login({
        claims,
        raw: fixed,
      });

      return <Redirect to="/" />;
    } catch (err) {
      console.error(err);
    }

    return <InvalidToken />;
  };

export const LoginPage = connect<{}, LoginPageDispatchProps, RouteComponentProps<LoginPageParams>>(
  () => ({}),
  dispatch => ({
    login: data => dispatch(loginAction(data)),
  }) as LoginPageDispatchProps,
)(LoginPageComponent);
