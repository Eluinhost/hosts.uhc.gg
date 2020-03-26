import { Redirect, RouteComponentProps } from 'react-router';
import * as React from 'react';
import { isLoggedIn } from '../state/Selectors';
import { connect } from 'react-redux';
import { NonIdealState } from '@blueprintjs/core';
import { parse } from 'query-string';
import { Dispatch } from 'redux';
import { ApplicationState } from '../state/ApplicationState';
import { createSelector } from 'reselect';
import { Authentication, LoginPayload } from '../actions';

type StateProps = {
  readonly loggedIn: boolean;
};

type DispatchProps = {
  readonly login: (data: LoginPayload) => void;
};

type State = {
  readonly redirectPath: string | null;
};

const InvalidToken: React.FunctionComponent = () => <NonIdealState title="Invalid login token" icon="warning-sign" />;

export class LoginPageComponent extends React.Component<RouteComponentProps<any> & StateProps & DispatchProps, State> {
  state = {
    redirectPath: null,
  };

  componentDidMount() {
    const { path, token, refresh } = parse(this.props.location.search);

    if (path && token && refresh && path.startsWith('/')) {
      this.props.login({
        accessToken: token,
        refreshToken: refresh,
      });

      this.setState(p => ({ redirectPath: path }));
    } else {
      console.error('Invalid token parameters', path, token, refresh);
    }
  }

  render() {
    if (this.props.loggedIn) {
      return <Redirect to={this.state.redirectPath || '/'}/>;
    }

    return <InvalidToken/>;
  }
}

const stateSelector = createSelector<ApplicationState, boolean, StateProps>(isLoggedIn, loggedIn => ({
  loggedIn,
}));

export const LoginPage: React.ComponentClass<RouteComponentProps<any>> = connect<
  StateProps,
  DispatchProps,
  RouteComponentProps<any>
>(stateSelector, (dispatch: Dispatch<ApplicationState>): DispatchProps => ({
  login: (data: LoginPayload) => dispatch(Authentication.login(data)),
}))(LoginPageComponent);
