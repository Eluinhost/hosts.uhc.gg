import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { AnchorButton } from "@blueprintjs/core";

const LoginButtonComponent: React.FunctionComponent<RouteComponentProps> = ({ location }) => (
  <AnchorButton minimal icon="user" href={`/authenticate?path=${encodeURIComponent(location.pathname)}`}>
    Log In
  </AnchorButton>
);

export const LoginButton: React.ComponentClass<any> = withRouter(LoginButtonComponent);
