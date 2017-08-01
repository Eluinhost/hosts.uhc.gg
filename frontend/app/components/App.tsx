import * as React from 'react';
import { HostingPage } from './host';
import { NonIdealState } from '@blueprintjs/core';
import { BrowserRouter } from 'react-router-dom';
import { Route, RouteComponentProps, RouteProps, Switch, withRouter } from 'react-router';
import { LoginPage } from './LoginPage';
import { omit, contains } from 'ramda';
import { connect } from 'react-redux';
import { ApplicationState } from '../state/ApplicationState';
import { HomePage } from './HomePage';
import { MatchesPage } from './matches';
import { LoginButton } from './LoginButton';
import { Navbar } from './Navbar';
import { isString } from 'util';
import { MembersPage } from './members';
import { ProfilePage } from './profile/index';

const NotFoundPage: React.SFC<RouteComponentProps<any>> = () => (
  <NonIdealState
    title="Not Found"
    visual="geosearch"
  />
);

type PermissionCheckFn = {
  (loggedIn: boolean, perms: string[]): boolean;
};

type AuthedRouteProps = {
  loggedIn: boolean;
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
  const fn: PermissionCheckFn = isString(props.required)
    ? (loggedIn, perms) => contains<string>(props.required as string, perms)
    : props.required;

  if (fn(props.loggedIn, props.permissions))
    return <Route {...omit(['permissions', 'required'], props) as RouteProps} />;

  return <Route component={NoPermissionRoute} />;
};

type RoutesStateProps = {
  readonly loggedIn: boolean;
  readonly permissions: string[];
};

const allowAny: PermissionCheckFn = (loggedIn: boolean) => loggedIn;

const RoutesComponent : React.SFC<RoutesStateProps & RouteComponentProps<any>> = props => (
  <Switch>
    <AuthedRoute path="/host" component={HostingPage} required="host" {...props}/>
    <Route path="/matches" component={MatchesPage} />
    <Route path="/members" component={MembersPage} />
    <Route path="/login" component={LoginPage} />
    <AuthedRoute path="/profile" component={ProfilePage} required={allowAny} {...props}/>
    <Route path="/" exact component={HomePage}/>
    <Route component={NotFoundPage} />
  </Switch>
);

const mapStateToProps = (state: ApplicationState): RoutesStateProps => ({
  loggedIn: state.authentication.loggedIn,
  permissions: state.authentication.loggedIn ? state.authentication.data!.accessTokenClaims.permissions : [],
});

const Routes: React.ComponentClass<{}> = withRouter<{}>(
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
