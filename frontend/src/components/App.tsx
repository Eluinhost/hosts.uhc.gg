import { EmptyState, Loader, Stack } from '@mantine/core';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import { useAtomValue } from 'jotai';
import React, { type PropsWithChildren, lazy, Suspense, useEffect } from 'react';
import * as reactGa from 'react-ga';
import { Route, Routes, useLocation } from 'react-router';

import { isLoggedInAtom } from '../atoms/authentication';
import { useAuthRefresh } from '../authentication/useAuthRefresh';
import { UpcomingMatchesPage } from '../matches/pages/UpcomingMatchesPage';
import { TimeSettings } from '../time/components/TimeSettings';

import styles from './App.module.css';
import { Footer } from './footer/Footer';
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
  <Stack flex={1} justify="center" align="center">
    <title>uhc.gg | Not Found</title>
    <EmptyState icon={<MagnifyingGlassIcon />} title="Not Found" />
  </Stack>
);

const requiresHostPermission = (permission: string | string[]): boolean =>
  (Array.isArray(permission) ? permission : [permission]).some(p => ['host', 'trial host'].includes(p));

const HOST_PERMISSIONS: string[] = ['host', 'trial host'];
const NO_PERMISSIONS: string[] = [];
const ADVISOR_PERMISSIONS: string[] = ['hosting advisor'];

const AuthenticatedRoute: React.FC<PropsWithChildren<{ permission: Array<string> }>> = ({ permission, children }) => {
  const authenticated = useAtomValue(isLoggedInAtom);

  const Alternative = !authenticated
    ? PromptToLogin
    : requiresHostPermission(permission)
      ? PromptToApplyForHost
      : NotAllowed;

  return (
    <WithPermission
      permission={permission}
      alternative={() => (
        <Stack flex={1} align="center" justify="center">
          <Alternative />
        </Stack>
      )}
    >
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
    <Suspense fallback={<Loader />}>
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

  return (
    <Stack w="100vw" h="100vh" align="stretch" gap={0} className={styles.app}>
      <Navbar />
      <TimeSettings />
      <Stack flex={1}>
        <AppRoutes />
      </Stack>
      <Footer />
    </Stack>
  );
};
