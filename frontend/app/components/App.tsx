import * as React from 'react';
import { HostForm } from './host';
import { NonIdealState } from '@blueprintjs/core';
import { BrowserRouter } from 'react-router-dom';
import { Route, RouteComponentProps, RouteProps, Switch, withRouter } from 'react-router';
import { LoginPage } from './LoginPage';
import { omit, any, equals, either, contains } from 'ramda';
import { connect } from 'react-redux';
import { ApplicationState } from '../state/ApplicationState';
import { HomePage } from './HomePage';
import { MatchesPage } from './matches';
import { LoginButton } from './LoginButton';
import { Navbar } from './Navbar';
import { isString } from 'util';
import { MembersPage } from './members';

const HostFormPage: React.SFC<RouteComponentProps<any>> = () => <HostForm />;
const NotFoundPage: React.SFC<RouteComponentProps<any>> = () => (
  <NonIdealState
    title="Not Found"
    visual="geosearch"
  />
);

type PermissionCheckFn = {
  (perms: string[]): boolean;
};

type AuthedRouteProps = {
  permissions: string[];
  required: string | PermissionCheckFn;
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
  const fn: PermissionCheckFn = isString(props.required) ? contains<string>(props.required) : props.required;

  if (fn(props.permissions))
    return <Route {...omit(['permissions', 'required'], props) as RouteProps} />;

  return <Route component={NoPermissionRoute} />;
};

type RoutesStateProps = {
  permissions: string[];
};

const matchesPagePermissions: PermissionCheckFn = any(either(equals('moderator'), equals('host')));

const RoutesComponent : React.SFC<RoutesStateProps & RouteComponentProps<any>> = ({ permissions }) => (
  <Switch>
    <AuthedRoute path="/host" component={HostFormPage} required="host" permissions={permissions} />
    <AuthedRoute
      path="/matches"
      component={MatchesPage}
      required={matchesPagePermissions}
      permissions={permissions}
    />
    <Route path="/members" component={MembersPage} />
    <Route path="/login" component={LoginPage} />
    <Route path="/" exact component={HomePage}/>
    <Route component={NotFoundPage} />
  </Switch>
);

function mapStateToProps(state: ApplicationState): RoutesStateProps {
  return {
    permissions: state.authentication.loggedIn ? state.authentication.data!.accessTokenClaims.permissions : [],
  };
}

const Routes = withRouter<{}>(
  connect<RoutesStateProps, {}, RouteComponentProps<any>>(mapStateToProps)(RoutesComponent),
);

export const App: React.SFC = () => (
  <BrowserRouter>
    <div className="pt-dark">
      <Navbar />
      <div className="app-container">
        <Routes />
      </div>
    </div>
  </BrowserRouter>
);
