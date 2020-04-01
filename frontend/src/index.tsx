import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import { App } from './components/App';
import { createReduxStore } from './state/ApplicationState';
import { Provider } from 'react-redux';

import './main.sass';

import 'react-dates/initialize';

createReduxStore().then(store => {
  ReactDOM.render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>,
    document.getElementById('root'),
  );
});

serviceWorker.unregister();