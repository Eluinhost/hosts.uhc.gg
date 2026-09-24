import { HotkeysProvider, OverlaysProvider } from '@blueprintjs/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import { migrateOldIndexDb } from './atoms/migrateOldIndexDb';
import { App } from './components/App';

import 'normalize.css/normalize.css';
import '@rc-component/picker/assets/index.css';
import 'react-virtualized/styles.css';
import '../resources/blueprint.css';
import './main.sass';

const queryClient = new QueryClient();

const DevTools = import.meta.env.DEV ? lazy(() => import('./dev/DevTools').then(m => ({ default: m.DevTools }))) : null;

const root = document.getElementById('root');

if (!root) {
  throw new Error('Could not find root element');
}

void (async () => {
  try {
    await migrateOldIndexDb();
  } catch (error) {
    console.error('Failed to migrate legacy IndexedDB settings, continuing anyway...', error);
  }

  createRoot(root).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <OverlaysProvider>
          <HotkeysProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </HotkeysProvider>
        </OverlaysProvider>
        {DevTools && (
          <Suspense fallback={null}>
            <DevTools />
          </Suspense>
        )}
      </QueryClientProvider>
    </React.StrictMode>,
  );
})();
