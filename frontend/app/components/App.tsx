import * as React from 'react';
import { Username } from './Username';
import { HostForm } from './HostForm';
import { NonIdealState } from '@blueprintjs/core';
import { BrowserRouter } from 'react-router-dom';
import { Route, RouteComponentProps, Switch } from 'react-router';
import { LoginPage } from './LoginPage';

const NavBar: React.SFC = () => (
  <nav className="pt-navbar .modifier">
    <div className="pt-navbar-group pt-align-left">
      <div className="pt-navbar-heading">uhc.gg hosting</div>
    </div>
    <div className="pt-navbar-group pt-align-right">
      <Username />
    </div>
  </nav>
);

const HostFormPage: React.SFC<RouteComponentProps<any>> = () => <HostForm />;
const NotFoundPage: React.SFC<RouteComponentProps<any>> = () => (
  <NonIdealState
    title="Not Found"
    visual="geosearch"
  />
);

export const App: React.SFC = () => (
  <BrowserRouter>
    <div className="pt-dark">
      <NavBar />
      <div className="app-container">
        <Switch>
          <Route path="/host" component={HostFormPage} />
          <Route path="/login/:token" component={LoginPage} />
          <Route component={NotFoundPage} />
        </Switch>
      </div>
    </div>
  </BrowserRouter>
);
