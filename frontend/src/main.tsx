import { HotkeysProvider, OverlaysProvider } from '@blueprintjs/core';
import { TanStackDevtools } from '@tanstack/react-devtools';
import { formDevtoolsPlugin } from '@tanstack/react-form-devtools';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { DevTools as JotaiDevTools } from 'jotai-devtools';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router';

import { App } from './components/App';
import { createReduxStore } from './state/ApplicationState';

import 'jotai-devtools/styles.css';
import './main.sass';

const queryClient = new QueryClient();

const formDevTools = formDevtoolsPlugin();

const store = createReduxStore();

const root = document.getElementById('root');

if (!root) {
  throw new Error('Could not find root element');
}

createRoot(root).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <OverlaysProvider>
          <HotkeysProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </HotkeysProvider>
        </OverlaysProvider>
      </Provider>
      <ReactQueryDevtools />
      <TanStackDevtools plugins={[formDevTools]} />
      <JotaiDevTools />
    </QueryClientProvider>
  </React.StrictMode>,
);
