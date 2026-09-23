import { HotkeysProvider, OverlaysProvider } from '@blueprintjs/core';
import { TanStackDevtools } from '@tanstack/react-devtools';
import { formDevtoolsPlugin } from '@tanstack/react-form-devtools';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { DevTools as JotaiDevTools } from 'jotai-devtools';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import { migrateOldIndexDb } from './atoms/migrateOldIndexDb';
import { App } from './components/App';

import 'jotai-devtools/styles.css';
import './main.sass';

const queryClient = new QueryClient();

const formDevTools = formDevtoolsPlugin();

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
        <ReactQueryDevtools />
        <TanStackDevtools plugins={[formDevTools]} />
        <JotaiDevTools />
      </QueryClientProvider>
    </React.StrictMode>,
  );
})();
