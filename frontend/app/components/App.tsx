import * as React from 'react';
import { Username } from './Username';
import { HostForm } from './HostForm';
import { NonIdealState } from '@blueprintjs/core';
import { BrowserRouter } from 'react-router-dom';
import { Route, RouteComponentProps, RouteProps, Switch } from 'react-router';
import { LoginPage } from './LoginPage';
import { omit } from 'ramda';
import { connect } from 'react-redux';
import { ApplicationState } from '../state/ApplicationState';

const NavBar: React.SFC = () => (
  <nav className="pt-navbar .modifier">
    <div className="pt-navbar-group pt-align-left">
      <div className="pt-navbar-heading">uhc.gg hosting</div>
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

const AuthedRoute: React.SFC<AuthedRouteProps> = (props) => {
  if (!props.permissions.some(perm => perm === props.required))
    return (
      <NonIdealState
        title="You do not have permission to do this"
        visual="warning"
      />
    );

  return <Route {...omit(['permissions', 'required'], props) as RouteProps} />;
};

type RoutesStateProps = {
  permissions: string[];
};

const RoutesComponent : React.SFC<RoutesStateProps> = ({ permissions }) => (
  <Switch>
    <AuthedRoute path="/host" component={HostFormPage} required="host" permissions={permissions} />
    <Route path="/login/:token" component={LoginPage} />
    <Route component={NotFoundPage} />
  </Switch>
);

function mapStateToProps(state: ApplicationState): RoutesStateProps {
  return {
    permissions: state.authentication.loggedIn ? state.authentication.data!.claims.permissions : [],
  };
}

const Routes = connect<RoutesStateProps, {}, {}>(mapStateToProps)(RoutesComponent);

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
