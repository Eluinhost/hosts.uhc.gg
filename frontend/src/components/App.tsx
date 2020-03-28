import React, { ComponentType } from "react";
import { HostingPage } from './host';
import { Classes, NonIdealState } from "@blueprintjs/core";
import { BrowserRouter } from 'react-router-dom';
import { Route, RouteComponentProps, RouteProps, Switch, withRouter } from 'react-router';
import { LoginPage } from './LoginPage';
import { HomePage } from './HomePage';
import { UpcomingMatchesPage } from './upcoming-matches-page';
import { LoginButton } from './LoginButton';
import { Navbar } from './Navbar';
import { MembersPage } from './members';
import { ProfilePage } from './profile';
import { WithPermission } from './WithPermission';
import { HistoryPage } from './host-history-page';
import { connect } from 'react-redux';
import { ApplicationState } from '../state/ApplicationState';
import { createSelector } from 'reselect';
import { isDarkMode } from '../state/Selectors';
import { always } from 'ramda';
import { GlobalHotkeys } from './GlobalHotkeys';
import { MatchDetailsPage } from './match-details-page';
import * as reactGa from 'react-ga';
import { Location } from 'history';
import { TimeSettings } from './time/TimeSettings';
import { HostingAlertsPage } from './hosting-alerts';
import { Footer } from './footer';
import Helmet from "react-helmet";
import { CreateBanPage } from "./ubl/CreateBanPage";
import { CurrentUblPage, UuidHistoryPage } from "./ubl";

reactGa.initialize('UA-71696797-2');

class NotFoundPage extends React.PureComponent<RouteComponentProps<any>> {
  render() {
    return <NonIdealState title="Not Found" icon="geosearch" />;
  }
}

class NoPermission extends React.PureComponent {
  public render() {
    return (
      <NonIdealState
        title="Forbidden"
        description="You do not have permission to use this. You may attempt to login with an authorised account below"
        icon="warning-sign"
        action={<LoginButton />}
      />
    );
  }
}

type AuthenticatedRouteProps = {
  readonly permission: string | string[];
} & RouteProps;

class AuthenticatedRoute extends React.PureComponent<AuthenticatedRouteProps> {
  public render() {
    const { permission, ...routeProps } = this.props;

    const Component: React.ComponentType<RouteComponentProps<any>> = this.props.component!;

    const component: React.FunctionComponent<RouteComponentProps<any>> = props => (
      <WithPermission permission={permission} alternative={NoPermission}>
        <Component {...props} />
      </WithPermission>
    );

    return <Route {...routeProps} component={component} />;
  }
}

class RoutesComponent extends React.PureComponent<RouteComponentProps<any>> {
  public componentDidMount() {
    const send = (location: Location) => {
      const path = location.pathname + location.search;

      reactGa.set({ page: path });
      reactGa.pageview(path);
    };

    this.props.history.listen(send);
    send(this.props.location);
  }

  public render() {
    return (
      <Switch>
        <AuthenticatedRoute path="/host" component={HostingPage} permission={['host', 'trial host']} {...this.props} />
        <Route path="/m/:id" component={MatchDetailsPage} />
        <Route path="/matches/:host" component={HistoryPage} />
        <Route path="/matches" component={UpcomingMatchesPage} />
        <Route path="/members" component={MembersPage} />
        <Route path="/login" component={LoginPage} />
        <AuthenticatedRoute path="/profile" component={ProfilePage} permission={[]} {...this.props} />
        <AuthenticatedRoute path="/ubl/create" component={CreateBanPage} permission="ubl moderator" {...this.props} />
        <Route path="/ubl/:uuid" component={UuidHistoryPage} />
        <Route path="/ubl" component={CurrentUblPage} />
        <AuthenticatedRoute
          path="/hosting-alerts"
          component={HostingAlertsPage}
          permission="hosting advisor"
          {...this.props}
        />
        <Route path="/" exact component={HomePage} />
        <Route component={NotFoundPage} />
      </Switch>
    );
  }
}

const Routes: React.ComponentClass<{}> = withRouter(RoutesComponent);

type AppProps = {
  readonly isDarkMode: boolean;
};

type AppState = {
  readonly navbarSticky: boolean;
};

class AppComponent extends React.PureComponent<AppProps, AppState> {
  state = {
    navbarSticky: window.scrollY > 50, // upper navbar is 50px
  };

  private onScroll = (): void =>
    this.setState({
      navbarSticky: window.scrollY > 50,
    });

  componentDidMount() {
    document.addEventListener('scroll', this.onScroll);
  }

  componentWillUnmount() {
    document.removeEventListener('scroll', this.onScroll);
  }

  private wrapperClass = () => {
    let classes = ['full-page'];

    if (this.props.isDarkMode) classes.push(Classes.DARK);

    if (this.state.navbarSticky) classes.push('navbar-sticky');

    return classes.join(' ');
  };

  public render() {
    return (
      <BrowserRouter>
        <GlobalHotkeys>
          <div className={this.wrapperClass()}>
            <div style={{ flexGrow: 0 }}>
              <Navbar />
              <TimeSettings />
            </div>
            <div className="app-container">
              <Helmet titleTemplate="uhc.gg - %s" defaultTitle="uhc.gg" />
              <Routes />
            </div>

            <Footer />
          </div>
        </GlobalHotkeys>
      </BrowserRouter>
    );
  }
}

const stateSelector = createSelector<ApplicationState, boolean, AppProps>(isDarkMode, isDarkMode => ({
  isDarkMode,
}));

export const App: ComponentType = connect<AppProps, {}, {}>(stateSelector, always({}))(AppComponent);
