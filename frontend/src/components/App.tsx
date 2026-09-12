import React, { ComponentType, useCallback, useEffect, useState } from 'react';
import { HostingPage } from './host';
import { Classes, NonIdealState } from '@blueprintjs/core';
import { Route, RouteComponentProps, RouteProps, Switch, useHistory } from 'react-router';
import { LoginPage } from './LoginPage';
import { HomePage } from './HomePage';
import { UpcomingMatchesPage } from './upcoming-matches-page';
import { Navbar } from './Navbar';
import { MembersPage } from './members';
import { ProfilePage } from './profile';
import { WithPermission } from './WithPermission';
import { HistoryPage } from './host-history-page';
import { useSelector } from 'react-redux';
import { isDarkMode, isLoggedIn } from '../state/Selectors';
import { NotAllowed, PromptToApplyForHost, PromptToLogin } from './PermissionPrompts';
import { GlobalHotkeys } from './GlobalHotkeys';
import { MatchDetailsPage } from './match-details-page';
import * as reactGa from 'react-ga';
import { Location } from 'history';
import { TimeSettings } from './time/TimeSettings';
import { Footer } from './footer';
import Helmet from 'react-helmet';
import { ModifiersPage } from '../modifiers/components/ModifiersPage';
import { HostApplicationsPage } from '../hosting-applications/components/HostApplicationsPage';
import { ApplyHostApplicationPage } from '../hosting-applications/components/ApplyHostApplication';
import { QuizManagementPage } from '../hosting-applications/questions/components/QuizManagementPage';

reactGa.initialize('UA-71696797-2');

const NotFoundPage: React.FC = () => <NonIdealState title="Not Found" icon="geosearch" />;

const requiresHostPermission = (permission: string | string[]): boolean =>
  (Array.isArray(permission) ? permission : [permission]).some(p => ['host', 'trial host'].includes(p));

type AuthenticatedRouteProps = {
  readonly permission: string | string[];
} & RouteProps;

const AuthenticatedRoute: React.FC<AuthenticatedRouteProps> = ({ permission, component, ...routeProps }) => {
  const Component: React.ComponentType<RouteComponentProps<any>> = component!;
  const authenticated = useSelector(isLoggedIn);

  const alternative = !authenticated
    ? PromptToLogin
    : requiresHostPermission(permission)
    ? PromptToApplyForHost
    : NotAllowed;

  const wrapped: React.FunctionComponent<RouteComponentProps<any>> = props => (
    <WithPermission permission={permission} alternative={alternative}>
      <Component {...props} />
    </WithPermission>
  );

  return <Route {...routeProps} component={wrapped} />;
};

const Routes: React.FC = () => {
  const history = useHistory();

  useEffect(() => {
    const send = (location: Location) => {
      const path = location.pathname + location.search;

      reactGa.set({ page: path });
      reactGa.pageview(path);
    };

    const unsubscribe = history.listen(send);
    send(history.location);

    return unsubscribe;
  }, [history]);

  return (
    <Switch>
      <AuthenticatedRoute path="/host" component={HostingPage} permission={['host', 'trial host']} />
      <Route path="/m/:id" component={MatchDetailsPage} />
      <Route path="/matches/:host" component={HistoryPage} />
      <Route path="/matches" component={UpcomingMatchesPage} />
      <Route path="/host-applications/apply" component={ApplyHostApplicationPage} />
      <Route path="/host-applications" component={HostApplicationsPage} />
      <Route path="/members" component={MembersPage} />
      <Route path="/login" component={LoginPage} />
      <AuthenticatedRoute path="/profile" component={ProfilePage} permission={[]} />
      <AuthenticatedRoute path="/modifiers" component={ModifiersPage} permission="hosting advisor" />
      <AuthenticatedRoute path="/quiz" component={QuizManagementPage} permission="hosting advisor" />
      <Route path="/" exact component={HomePage} />
      <Route component={NotFoundPage} />
    </Switch>
  );
};

export const App: ComponentType = () => {
  const darkModeEnabled = useSelector(isDarkMode);
  const [navbarSticky, setNavbarSticky] = useState(window.scrollY > 50); // upper navbar is 50px
  const onScroll = useCallback(() => setNavbarSticky(window.scrollY > 50), []);

  useEffect(() => {
    document.addEventListener('scroll', onScroll);
    return () => document.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  let classes = ['full-page'];

  if (darkModeEnabled) classes.push(Classes.DARK);
  if (navbarSticky) classes.push('navbar-sticky');

  return (
    <GlobalHotkeys>
      <div className={classes.join(' ')}>
        <div style={{ flexGrow: 0 }}>
          <Navbar />
          <TimeSettings />
        </div>
        <div className="app-container">
          <Helmet titleTemplate="uhc.gg - %s" defaultTitle="uhc.gg" />
          <Routes />
        </div>
        <Footer />
      </div>
    </GlobalHotkeys>
  );
};
