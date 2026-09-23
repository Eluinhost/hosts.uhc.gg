import { Classes, NonIdealState, Spinner } from '@blueprintjs/core';
import { GeosearchIcon } from '@blueprintjs/icons';
import { useAtomValue } from 'jotai';
import React, { type PropsWithChildren, lazy, Suspense, useCallback, useEffect, useState } from 'react';
import * as reactGa from 'react-ga';
import { Route, Routes, useLocation } from 'react-router';

import { isLoggedInAtom } from '../atoms/authentication';
import { isDarkModeAtom } from '../atoms/isDarkMode';
import { useAuthRefresh } from '../authentication/useAuthRefresh';
import { UpcomingMatchesPage } from '../matches/pages/UpcomingMatchesPage';
import { TimeSettings } from '../time/components/TimeSettings';

import { Footer } from './footer';
import { Navbar } from './Navbar';
import { NotAllowed, PromptToApplyForHost, PromptToLogin } from './PermissionPrompts';
import { useGlobalHotkeys } from './useGlobalHotkeys';
import { WithPermission } from './WithPermission';

reactGa.initialize('UA-71696797-2');

const HostingPage = lazy(() => import('./host').then(m => ({ default: m.HostingPage })));
const MatchDetailsPage = lazy(() =>
  import('../matches/pages/MatchDetailsPage').then(m => ({ default: m.MatchDetailsPage })),
);
const HistoryPage = lazy(() => import('./host-history-page').then(m => ({ default: m.HistoryPage })));
const ApplyHostApplicationPage = lazy(() =>
  import('../hosting-applications/components/ApplyHostApplication').then(m => ({
    default: m.ApplyHostApplicationPage,
  })),
);
const HostApplicationsPage = lazy(() =>
  import('../hosting-applications/HostApplicationsPage').then(m => ({ default: m.HostApplicationsPage })),
);
const MembersPage = lazy(() => import('../members/components/MembersPage').then(m => ({ default: m.MembersPage })));
const LoginPage = lazy(() => import('./LoginPage').then(m => ({ default: m.LoginPage })));
const ProfilePage = lazy(() => import('./profile').then(m => ({ default: m.ProfilePage })));
const ModifiersPage = lazy(() =>
  import('../modifiers/components/ModifiersPage').then(m => ({ default: m.ModifiersPage })),
);
const QuizManagementPage = lazy(() =>
  import('../hosting-applications/questions/QuizManagementPage').then(m => ({
    default: m.QuizManagementPage,
  })),
);
const HomePage = lazy(() => import('./HomePage').then(m => ({ default: m.HomePage })));

const NotFoundPage: React.FC = () => (
  <>
    <title>uhc.gg | Not Found</title>
    <NonIdealState title="Not Found" icon={<GeosearchIcon />} />
  </>
);

const requiresHostPermission = (permission: string | string[]): boolean =>
  (Array.isArray(permission) ? permission : [permission]).some(p => ['host', 'trial host'].includes(p));

const HOST_PERMISSIONS: string[] = ['host', 'trial host'];
const NO_PERMISSIONS: string[] = [];
const ADVISOR_PERMISSIONS: string[] = ['hosting advisor'];

const AuthenticatedRoute: React.FC<PropsWithChildren<{ permission: Array<string> }>> = ({ permission, children }) => {
  const authenticated = useAtomValue(isLoggedInAtom);

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
    <Suspense fallback={<Spinner style={{ display: 'block', margin: '100px auto 0' }} />}>
      <Routes>
        <Route
          path="/host"
          element={
            <AuthenticatedRoute permission={HOST_PERMISSIONS}>
              <HostingPage />
            </AuthenticatedRoute>
          }
        />
        <Route path="/m/:id" element={<MatchDetailsPage />} />
        <Route path="/matches/:host" element={<HistoryPage />} />
        <Route path="/matches" element={<UpcomingMatchesPage />} />
        <Route path="/host-applications/apply" element={<ApplyHostApplicationPage />} />
        <Route path="/host-applications" element={<HostApplicationsPage />} />
        <Route path="/members" element={<MembersPage />} />
        <Route path="/login" element={<LoginPage />} />
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
        <Route path="/" index element={<HomePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export const App: React.FC = () => {
  useAuthRefresh();
  useGlobalHotkeys();

  const darkModeEnabled = useAtomValue(isDarkModeAtom);
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
        <AppRoutes />
      </div>
      <Footer />
    </div>
  );
};
