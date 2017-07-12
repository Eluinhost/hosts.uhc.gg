import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

const LoginButtonComponent: React.SFC<RouteComponentProps<any>> = ({ location }) => (
  <a
    className="pt-button pt-minimal pt-icon-user"
    href={`/authenticate?path=${encodeURIComponent(location.pathname)}`}
  >
    Log In
  </a>
);

export const LoginButton: React.ComponentClass = withRouter<{}>(LoginButtonComponent);
