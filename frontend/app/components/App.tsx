import * as React from 'react';
import { Username } from './Username';
import { HostForm } from './HostForm';
import { NonIdealState } from '@blueprintjs/core';
import { BrowserRouter, Link } from 'react-router-dom';
import { Route, RouteComponentProps, RouteProps, Switch, withRouter } from 'react-router';
import { LoginPage } from './LoginPage';
import { omit } from 'ramda';
import { connect } from 'react-redux';
import { ApplicationState } from '../state/ApplicationState';
import { HomePage } from './HomePage';
import { MatchModerationPage } from './MatchModerationPage';

const NavBar: React.SFC = () => (
  <nav className="pt-navbar .modifier">
    <div className="pt-navbar-group pt-align-left">
      <Link to="/">
        <div className="pt-navbar-heading">uhc.gg hosting</div>
      </Link>
    </div>
    <div className="pt-navbar-group pt-align-right">
      <Username />
    </div>
  </nav>
);

const HostFormPage: React.SFC<RouteComponentProps<any>> = () => <HostForm />;
const NotFoundPage: React.SFC<RouteComponentProps<any>> = () => (
  <NonIdealState
    title="Not Found"
    visual="geosearch"
  />
);

type AuthedRouteProps = {
  permissions: string[];
  required: string;
} & RouteProps;

const NoPermissionAction: React.SFC = () => (
  <a className="pt-button pt-minimal pt-icon-user" href="/authenticate">
    Go to Log In
  </a>
);

const NoPermissionRoute: React.SFC = () => (
  <NonIdealState
    title="Forbidden"
    description="You do not have permission to use this. You may attempt to login with an authorised account below"
    visual="warning-sign"
    action={<NoPermissionAction />}
  />
);

const AuthedRoute: React.SFC<AuthedRouteProps> = (props) => {
  if (!props.permissions.some(perm => perm === props.required))
    return <NoPermissionRoute />;

  return <Route {...omit(['permissions', 'required'], props) as RouteProps} />;
};

type RoutesStateProps = {
  permissions: string[];
};

const RoutesComponent : React.SFC<RoutesStateProps & RouteComponentProps<any>> = ({ permissions }) => (
  <Switch>
    <AuthedRoute path="/host" component={HostFormPage} required="host" permissions={permissions} />
    <AuthedRoute
      path="/moderate/matches"
      component={MatchModerationPage}
      required="moderator"
      permissions={permissions}
    />
    <Route path="/login/:token" component={LoginPage} />
    <Route path="/" exact component={HomePage}/>
    <Route component={NotFoundPage} />
  </Switch>
);

function mapStateToProps(state: ApplicationState): RoutesStateProps {
  return {
    permissions: state.authentication.loggedIn ? state.authentication.data!.claims.permissions : [],
  };
}

const Routes = withRouter<{}>(
  connect<RoutesStateProps, {}, RouteComponentProps<any>>(mapStateToProps)(RoutesComponent),
);

export const App: React.SFC = () => (
  <BrowserRouter>
    <div className="pt-dark">
      <NavBar />
      <div className="app-container">
        <Routes />
      </div>
    </div>
  </BrowserRouter>
);
