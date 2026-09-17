import { HotkeysProvider, OverlaysProvider } from '@blueprintjs/core';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router';

import { App } from './components/App';
import { createReduxStore } from './state/ApplicationState';

import './main.sass';

void createReduxStore().then(store => {
  const root = document.getElementById('root');

  if (!root) {
    console.error('Could not find root element');
    return;
  }

  createRoot(root).render(
    <React.StrictMode>
      <Provider store={store}>
        <OverlaysProvider>
          <HotkeysProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </HotkeysProvider>
        </OverlaysProvider>
      </Provider>
    </React.StrictMode>,
  );
});
