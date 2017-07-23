import 'babel-polyfill';
import 'whatwg-fetch';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { App } from './components/App';
import { createReduxStore } from './state/ApplicationState';
import { Provider } from 'react-redux';

createReduxStore()
  .then((store) => {
    // Add root element for React to body for rendering to
    const root = document.createElement('div');
    document.body.appendChild(root);

    ReactDOM.render(
      <Provider store={store}>
        <App/>
      </Provider>,
      root,
    );
  });


