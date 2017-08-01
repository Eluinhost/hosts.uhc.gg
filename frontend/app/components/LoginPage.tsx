import { Redirect, RouteComponentProps } from 'react-router';
import * as React from 'react';
import { AuthenticationActions, LoginPayload } from '../state/AuthenticationState';
import { connect } from 'react-redux';
import { NonIdealState } from '@blueprintjs/core';
import { parse } from 'query-string';
import { always } from 'ramda';
import { Dispatch } from 'redux';
import { ApplicationState } from '../state/ApplicationState';

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

export const LoginPage: React.ComponentClass<RouteComponentProps<any>> =
  connect<{}, LoginPageDispatchProps, RouteComponentProps<any>>(
    always({}),
    (dispatch: Dispatch<ApplicationState>) => ({
      login: data => dispatch(AuthenticationActions.login(data)),
    }) as LoginPageDispatchProps,
  )(LoginPageComponent);
