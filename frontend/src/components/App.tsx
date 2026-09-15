import { Classes, NonIdealState } from '@blueprintjs/core';
import React, { PropsWithChildren, useCallback, useEffect, useState } from 'react';
import * as reactGa from 'react-ga';
import ReactHelmet from 'react-helmet';
import { useSelector } from 'react-redux';
import { Route, Routes, useLocation } from 'react-router';

import { ApplyHostApplicationPage } from '../hosting-applications/components/ApplyHostApplication';
import { HostApplicationsPage } from '../hosting-applications/components/HostApplicationsPage';
import { QuizManagementPage } from '../hosting-applications/questions/components/QuizManagementPage';
import { ModifiersPage } from '../modifiers/components/ModifiersPage';
import { isDarkMode, isLoggedIn } from '../state/Selectors';

import { Footer } from './footer';
import { HomePage } from './HomePage';
import { HostingPage } from './host';
import { HistoryPage } from './host-history-page';
import { LoginPage } from './LoginPage';
import { MatchDetailsPage } from './match-details-page';
import { MembersPage } from './members';
import { Navbar } from './Navbar';
import { NotAllowed, PromptToApplyForHost, PromptToLogin } from './PermissionPrompts';
import { ProfilePage } from './profile';
import { TimeSettings } from './time/TimeSettings';
import { UpcomingMatchesPage } from './upcoming-matches-page';
import { useGlobalHotkeys } from './useGlobalHotkeys';
import { WithPermission } from './WithPermission';

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
  const onScroll = useCallback(() => {
    setNavbarSticky(window.scrollY > 50);
  }, []);

  useEffect(() => {
    document.addEventListener('scroll', onScroll);
    return () => {
      document.removeEventListener('scroll', onScroll);
    };
  }, [onScroll]);

  const classes = ['full-page'];

  if (darkModeEnabled) classes.push(Classes.DARK);
  if (navbarSticky) classes.push('navbar-sticky');

  return (
    <div className={classes.join(' ')}>
      <div style={{ flexGrow: 0 }}>
        <Navbar />
        <TimeSettings />
      </div>
      <div className="app-container">
        <ReactHelmet titleTemplate="uhc.gg - %s" defaultTitle="uhc.gg" />
        <AppRoutes />
      </div>
      <Footer />
    </div>
  );
};
