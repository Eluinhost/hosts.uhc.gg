import * as React from 'react';
import { HostingPage } from './host';
import { NonIdealState } from '@blueprintjs/core';
import { BrowserRouter } from 'react-router-dom';
import { Route, RouteComponentProps, RouteProps, Switch, withRouter } from 'react-router';
import { LoginPage } from './LoginPage';
import { HomePage } from './HomePage';
import { MatchesPage } from './matches';
import { LoginButton } from './LoginButton';
import { Navbar } from './Navbar';
import { MembersPage } from './members';
import { ProfilePage } from './profile/index';
import { WithPermission } from './WithPermission';
import { CurrentUblPage, UuidHistoryPage } from './ubl';
import { HistoryPage } from './history';
import { CreateBanPage } from './ubl/CreateBanPage';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { ApplicationState } from '../state/ApplicationState';
import { createSelector } from 'reselect';
import { isDarkMode } from '../state/Selectors';
import { always } from 'ramda';
import { GlobalHotkeys } from './GlobalHotkeys';
import { MatchDetailsPage } from './match-details';

const NotFoundPage: React.SFC = () => (
  <NonIdealState
    title="Not Found"
    visual="geosearch"
  />
);

const NoPermission: React.SFC = () => (
  <NonIdealState
    title="Forbidden"
    description="You do not have permission to use this. You may attempt to login with an authorised account below"
    visual="warning-sign"
    action={<LoginButton />}
  />
);

type AuthenticatedRouteProps = {
  readonly permission: string | string[];
} & RouteProps;

const AuthenticatedRoute: React.SFC<AuthenticatedRouteProps> = (props) => {
  const { permission, ...routeProps } = props;

  const Component: React.ComponentType<RouteComponentProps<any> | undefined> = props.component!;

  const component: React.SFC<RouteComponentProps<any>> = props => (
    <WithPermission permission={permission} alternative={NoPermission}>
      <Component {...props}/>
    </WithPermission>
  );

  return <Route {...routeProps} component={component}/>;
};

const RoutesComponent : React.SFC<RouteComponentProps<any>> = props => (
  <Switch>
    <AuthenticatedRoute path="/host" component={HostingPage} permission={['host', 'trial host']} {...props}/>
    <Route path="/m/:id" component={MatchDetailsPage} />
    <Route path="/matches/:host" component={HistoryPage} />
    <Route path="/matches" component={MatchesPage} />
    <Route path="/members" component={MembersPage} />
    <Route path="/login" component={LoginPage} />
    <AuthenticatedRoute path="/profile" component={ProfilePage} permission={[]} {...props} />
    {/*<AuthenticatedRoute path="/ubl/create" component={CreateBanPage} permission="ubl moderator" {...props} />*/}
    {/*<Route path="/ubl/:uuid" component={UuidHistoryPage} />*/}
    {/*<Route path="/ubl" component={CurrentUblPage} />*/}
    <Route path="/" exact component={HomePage}/>
    <Route component={NotFoundPage} />
  </Switch>
);

const Routes: React.ComponentClass<{}> = withRouter<{}>(RoutesComponent);

type AppProps = {
  readonly isDarkMode: boolean;
};

const AppComponent: React.SFC<AppProps> = ({ isDarkMode }) => (
  <BrowserRouter>
    <GlobalHotkeys>
      <div className={`${isDarkMode ? 'pt-dark' : ''} full-page`}>
        <div style={{ flexGrow: 0 }}>
          <Navbar />
        </div>
        <div className="app-container">
          <Helmet titleTemplate="uhc.gg - %s" defaultTitle="uhc.gg" />
          <Routes />
        </div>
      </div>
    </GlobalHotkeys>
  </BrowserRouter>
);

const stateSelector = createSelector<ApplicationState, boolean, AppProps>(
  isDarkMode,
  isDarkMode => ({
    isDarkMode,
  }),
);

export const App: React.ComponentClass = connect<AppProps, {}, {}>(
  stateSelector,
  always({}),
)(AppComponent);
