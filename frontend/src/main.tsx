import { HotkeysProvider, OverlaysProvider } from '@blueprintjs/core';
import { TanStackDevtools } from '@tanstack/react-devtools';
import { formDevtoolsPlugin } from '@tanstack/react-form-devtools';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router';

import { App } from './components/App';
import { createReduxStore } from './state/ApplicationState';

import './main.sass';

const queryClient = new QueryClient();

const formDevTools = formDevtoolsPlugin();

void createReduxStore().then(store => {
  const root = document.getElementById('root');

  if (!root) {
    console.error('Could not find root element');
    return;
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
        <TanStackDevtools plugins={[formDevTools]} />
      </QueryClientProvider>
    </React.StrictMode>,
  );
});
