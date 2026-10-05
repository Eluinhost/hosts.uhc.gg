import '@/styles';

import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { useAtomValue } from 'jotai';
import React from 'react';
import { createRoot } from 'react-dom/client';

import { isDarkModeAtom } from '@/atoms/isDarkMode';
import { migrateOldIndexDb } from '@/atoms/migrateOldIndexDb';
import { captureLoginRedirect } from '@/login/captureLoginRedirect';
import { routeTree } from '@/routeTree.gen';
import { theme } from '@/theme';

const queryClient = new QueryClient();

const root = document.getElementById('root');

if (!root) {
  throw new Error('Could not find root element');
}

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
  interface StaticDataRouteOption {
    requiredPermissions?: string[];
  }
}

const Root = () => {
  const isDarkMode = useAtomValue(isDarkModeAtom);

  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme} forceColorScheme={isDarkMode ? 'dark' : 'light'}>
        <Notifications />
        <RouterProvider router={router} />
      </MantineProvider>
    </QueryClientProvider>
  );
};

void (async () => {
  try {
    await migrateOldIndexDb();
  } catch (error) {
    console.error('Failed to migrate legacy IndexedDB settings, continuing anyway...', error);
  }

  captureLoginRedirect();

  createRoot(root).render(
    <React.StrictMode>
      <Root />
    </React.StrictMode>,
  );
})();
