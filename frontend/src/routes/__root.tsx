import { Container, EmptyState, Stack } from '@mantine/core';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { createRootRoute, Outlet, useLocation } from '@tanstack/react-router';
import { lazy, Suspense, useEffect } from 'react';
import reactGa from 'react-ga4';

import { AuthenticationApi } from '@/authentication/AuthenticationApi';
import { AuthSplash } from '@/authentication/components/AuthSplash';
import { LOGIN_ERROR_KEY } from '@/login/captureLoginRedirect';
import { showToast } from '@/services/AppToaster';
import { Footer } from '@/shell/components/Footer';
import { Navbar } from '@/shell/components/Navbar';
import { TimeSettings } from '@/time/components/TimeSettings';

export const Route = createRootRoute({ component: RootLayout, notFoundComponent: NotFound });

const DevTools = import.meta.env.DEV ? lazy(() => import('@/dev/DevTools').then(m => ({ default: m.DevTools }))) : null;

reactGa.initialize('G-J9VRXDDL1P');

function RootLayout() {
  const { isPending: isInitialising } = useQuery(AuthenticationApi.session);

  const { pathname, searchStr } = useLocation();

  useEffect(() => {
    const loginError = sessionStorage.getItem(LOGIN_ERROR_KEY);

    if (loginError) {
      sessionStorage.removeItem(LOGIN_ERROR_KEY);
      showToast({
        title: 'Login Error',
        message: loginError,
        color: 'red',
      });
    }
  }, []);

  useEffect(() => {
    if (isInitialising) return;

    const path = pathname + searchStr;

    reactGa.set({ page: path });
    reactGa.send({
      hitType: 'pageview',
      page: path,
    });
  }, [isInitialising, pathname, searchStr]);

  if (isInitialising) {
    return <AuthSplash />;
  }

  return (
    <>
      <Stack w="100vw" h="100vh" align="stretch" gap={0} style={{ overflow: 'scroll' }}>
        <Navbar />
        <TimeSettings />
        <Container component={Stack} flex={1} w="100%">
          <Outlet />
        </Container>
        <Footer />
      </Stack>
      {DevTools && (
        <Suspense fallback={null}>
          <DevTools />
        </Suspense>
      )}
    </>
  );
}

function NotFound() {
  return (
    <Stack flex={1} justify="center" align="center">
      <title>uhc.gg | Not Found</title>
      <EmptyState icon={<MagnifyingGlassIcon />} title="Not Found" />
    </Stack>
  );
}
