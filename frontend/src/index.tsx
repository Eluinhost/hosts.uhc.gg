import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import * as serviceWorker from './serviceWorker';
import { App } from './components/App';
import { createReduxStore } from './state/ApplicationState';

import './main.sass';

import 'react-dates/initialize';

createReduxStore().then(store => {
  ReactDOM.render(
    <React.StrictMode>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </React.StrictMode>,
    document.getElementById('root'),
  );
});

serviceWorker.unregister();
