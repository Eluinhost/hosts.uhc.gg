import '@/styles';

import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import { isDarkModeAtom } from '@/atoms/isDarkMode';
import { migrateOldIndexDb } from '@/atoms/migrateOldIndexDb';
import { App } from '@/shell/components/App';
import { theme } from '@/theme';

const queryClient = new QueryClient();

const DevTools = import.meta.env.DEV ? lazy(() => import('@/dev/DevTools').then(m => ({ default: m.DevTools }))) : null;

const root = document.getElementById('root');

if (!root) {
  throw new Error('Could not find root element');
}

const Root = () => {
  const isDarkMode = useAtomValue(isDarkModeAtom);

  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme} forceColorScheme={isDarkMode ? 'dark' : 'light'}>
        <Notifications />
        <BrowserRouter>
          <App />
        </BrowserRouter>
        {DevTools && (
          <Suspense fallback={null}>
            <DevTools />
          </Suspense>
        )}
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

  createRoot(root).render(
    <React.StrictMode>
      <Root />
    </React.StrictMode>,
  );
})();
