import React, { PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { HostingPage } from './host';
import { Classes, NonIdealState } from '@blueprintjs/core';
import { Route, Routes, useLocation } from 'react-router';
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
import { useGlobalHotkeys } from './useGlobalHotkeys';
import { MatchDetailsPage } from './match-details-page';
import * as reactGa from 'react-ga';
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

const HOST_PERMISSIONS: string[] = ['host', 'trial host'];
const NO_PERMISSIONS: string[] = [];
const ADVISOR_PERMISSIONS: string[] = ['hosting advisor'];

const AuthenticatedRoute: React.FC<PropsWithChildren<{ permission: Array<string> }>> = ({ permission, children }) => {
  const authenticated = useSelector(isLoggedIn);

  const alternative = !authenticated
    ? PromptToLogin
    : requiresHostPermission(permission)
      ? PromptToApplyForHost
      : NotAllowed;

  return (
    <WithPermission permission={permission} alternative={alternative}>
      {children}
    </WithPermission>
  );
};

const AppRoutes: React.FC = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    const path = pathname + search;

    reactGa.set({ page: path });
    reactGa.pageview(path);
  }, [pathname, search]);

  return (
    <Routes>
      <Route
        path="/host"
        element={
          <AuthenticatedRoute permission={HOST_PERMISSIONS}>
            <HostingPage />
          </AuthenticatedRoute>
        }
      />
      <Route path="/m/:id" Component={MatchDetailsPage} />
      <Route path="/matches/:host" Component={HistoryPage} />
      <Route path="/matches" Component={UpcomingMatchesPage} />
      <Route path="/host-applications/apply" Component={ApplyHostApplicationPage} />
      <Route path="/host-applications" Component={HostApplicationsPage} />
      <Route path="/members" Component={MembersPage} />
      <Route path="/login" Component={LoginPage} />
      <Route
        path="/profile"
        element={
          <AuthenticatedRoute permission={NO_PERMISSIONS}>
            <ProfilePage />
          </AuthenticatedRoute>
        }
      />
      <Route
        path="/modifiers"
        element={
          <AuthenticatedRoute permission={ADVISOR_PERMISSIONS}>
            <ModifiersPage />
          </AuthenticatedRoute>
        }
      />
      <Route
        path="/quiz"
        element={
          <AuthenticatedRoute permission={ADVISOR_PERMISSIONS}>
            <QuizManagementPage />
          </AuthenticatedRoute>
        }
      />
      <Route path="/" index Component={HomePage} />
      <Route path="*" Component={NotFoundPage} />
    </Routes>
  );
};

export const App: React.FC = () => {
  useGlobalHotkeys();

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
    <div className={classes.join(' ')}>
      <div style={{ flexGrow: 0 }}>
        <Navbar />
        <TimeSettings />
      </div>
      <div className="app-container">
        <Helmet titleTemplate="uhc.gg - %s" defaultTitle="uhc.gg" />
        <AppRoutes />
      </div>
      <Footer />
    </div>
  );
};
