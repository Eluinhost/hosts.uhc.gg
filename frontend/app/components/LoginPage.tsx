import { Redirect, RouteComponentProps } from 'react-router';
import * as React from 'react';
import { AuthenticationData, AuthenticationActions, parseJwt } from '../state/AuthenticationState';
import { connect } from 'react-redux';
import { NonIdealState } from '@blueprintjs/core';
import { parse } from 'query-string';

export type LoginPageDispatchProps = {
  readonly login: (data: AuthenticationData) => any;
};

const InvalidToken: React.SFC = () => <NonIdealState title="Invalid login token" visual="warning-sign" />;

export const LoginPageComponent: React.SFC<RouteComponentProps<any> & LoginPageDispatchProps> =
  ({ location, login }) => {
    const { path, token } = parse(location.search);

    if (!path || !token || !path.startsWith('/'))
      return <InvalidToken />;


    try {
      const claims = parseJwt(token);

      login({
        claims,
        raw: token,
      });

      return <Redirect to={path} />;
    } catch (err) {
      console.error(err);
    }

    return <InvalidToken />;
  };

export const LoginPage = connect<{}, LoginPageDispatchProps, RouteComponentProps<any>>(
  () => ({}),
  dispatch => ({
    login: data => dispatch(AuthenticationActions.login(data)),
  }) as LoginPageDispatchProps,
)(LoginPageComponent);
