import { Redirect, RouteComponentProps } from 'react-router';
import * as React from 'react';
import {
  AuthenticationData,
  AuthenticationActions,
  parseAccessTokenClaims,
  parseRefreshTokenClaims,
  LoginPayload,
} from '../state/AuthenticationState';
import { connect } from 'react-redux';
import { NonIdealState } from '@blueprintjs/core';
import { parse } from 'query-string';

export type LoginPageDispatchProps = {
  readonly login: (data: LoginPayload) => boolean;
};

const InvalidToken: React.SFC = () => <NonIdealState title="Invalid login token" visual="warning-sign" />;

export const LoginPageComponent: React.SFC<RouteComponentProps<any> & LoginPageDispatchProps> =
  ({ location, login }) => {
    const { path, token, refresh } = parse(location.search);

    if (!path || !token || !refresh || !path.startsWith('/'))
      return <InvalidToken />;


    const loggedIn = login({
      accessToken: token,
      refreshToken: refresh,
    });

    if (loggedIn) {
      return <Redirect to={path} />;
    } else {
      return <InvalidToken />;
    }
  };

export const LoginPage = connect<{}, LoginPageDispatchProps, RouteComponentProps<any>>(
  () => ({}),
  dispatch => ({
    login: data => dispatch(AuthenticationActions.login(data)),
  }) as LoginPageDispatchProps,
)(LoginPageComponent);
