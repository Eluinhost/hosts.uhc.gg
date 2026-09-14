import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router';
import { HotkeysProvider, OverlaysProvider } from '@blueprintjs/core';

import * as serviceWorker from './serviceWorker';
import { App } from './components/App';
import { createReduxStore } from './state/ApplicationState';

import './main.sass';
import '@blueprintjs/core/lib/css/blueprint.css';

import 'react-dates/initialize';

createReduxStore().then(store => {
  createRoot(document.getElementById('root')!).render(
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

serviceWorker.unregister();
