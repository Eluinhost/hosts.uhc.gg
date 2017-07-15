import * as React from 'react';
import { Username } from './Username';
import { HostForm } from './HostForm';
import { Button, NonIdealState } from '@blueprintjs/core';
import { BrowserRouter, Link } from 'react-router-dom';
import { Route, RouteComponentProps, RouteProps, Switch, withRouter } from 'react-router';
import { LoginPage } from './LoginPage';
import { omit } from 'ramda';
import { connect } from 'react-redux';
import { ApplicationState } from '../state/ApplicationState';
import { HomePage } from './HomePage';
import { MatchModerationPage } from './MatchModerationPage';
import { LoginButton } from './LoginButton';

const NavBar: React.SFC = () => (
  <nav className="pt-navbar">
    <div className="pt-navbar-group">
      <Link to="/">
        <div className="pt-navbar-heading">uhc.gg hosting</div>
      </Link>
    </div>
    <div className="pt-navbar-group">
      <Link to="/host">
        <Button
          className="pt-minimal"
          iconName="cloud-upload"
        >
          Host
        </Button>
      </Link>
      <Link to="/moderate/matches">
        <Button
          className="pt-minimal"
          iconName="confirm"
        >
          Moderate
        </Button>
      </Link>
      <Link to="/moderate/users">
        <Button
          className="pt-minimal"
          iconName="take-action"
        >
          Admin
        </Button>
      </Link>
    </div>
    <div className="pt-navbar-group">
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

const NoPermissionRoute: React.SFC<RouteComponentProps<any>> = ({ location }) => (
  <NonIdealState
    title="Forbidden"
    description="You do not have permission to use this. You may attempt to login with an authorised account below"
    visual="warning-sign"
    action={<LoginButton />}
  />
);

const AuthedRoute: React.SFC<AuthedRouteProps> = (props) => {
  if (!props.permissions.some(perm => perm === props.required))
    return <Route component={NoPermissionRoute} />;

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
    <Route path="/login" component={LoginPage} />
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
