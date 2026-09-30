import { Container, EmptyState, Stack } from '@mantine/core';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import { createRootRoute, Outlet, useLocation } from '@tanstack/react-router';
import { lazy, Suspense, useEffect } from 'react';
import reactGa from 'react-ga4';

import { useAuthRefresh } from '@/authentication/useAuthRefresh';
import { Footer } from '@/shell/components/Footer';
import { Navbar } from '@/shell/components/Navbar';
import { TimeSettings } from '@/time/components/TimeSettings';

export const Route = createRootRoute({ component: RootLayout, notFoundComponent: NotFound });

const DevTools = import.meta.env.DEV ? lazy(() => import('@/dev/DevTools').then(m => ({ default: m.DevTools }))) : null;

reactGa.initialize('G-J9VRXDDL1P');

function RootLayout() {
  useAuthRefresh();

  const { pathname, searchStr } = useLocation();

  useEffect(() => {
    const path = pathname + searchStr;

    reactGa.set({ page: path });
    reactGa.send({
      hitType: 'pageview',
      page: path,
    });
  }, [pathname, searchStr]);

  return (
    <>
      <Stack w="100vw" h="100vh" align="stretch" gap={0}>
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
