import { RouteComponentProps, withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import { Button, Icon, IconName } from '@blueprintjs/core';
import * as React from 'react';
import { Username } from './Username';
import { createSelector } from 'reselect';
import { ApplicationState } from '../state/ApplicationState';
import { isDarkMode } from '../state/Selectors';
import { connect, Dispatch } from 'react-redux';
import { SettingsActions } from '../state/SettingsState';

type NavBarButtonProps = {
  readonly text: string;
  readonly icon: IconName;
  readonly to: string;
};

const NavBarButtonComponent: React.SFC<NavBarButtonProps & RouteComponentProps<any>> =
  ({ text, icon, to, location }) => (
    <Link to={to}>
      <Button
        className="pt-minimal"
        iconName={icon}
        active={location.pathname.startsWith(to)}
      >
        {text}
      </Button>
    </Link>
  );

const NavbarButton: React.ComponentClass<NavBarButtonProps> = withRouter<NavBarButtonProps>(NavBarButtonComponent);

type StateProps = {
  readonly isDarkMode: boolean;
};

type DispatchProps = {
  readonly toggleDarkMode: () => void;
};

const NavbarComponent: React.SFC<StateProps & DispatchProps> = ({ isDarkMode, toggleDarkMode }) => (
  <nav className="pt-navbar header-navbar">
    <div className="pt-navbar-group">
      <Link to="/">
        <img src="/logo.png" className="brand-logo" />
      </Link>
      <Link to="/">
        <div className="pt-navbar-heading">uhc.gg hosting</div>
      </Link>
    </div>
    <div className="pt-navbar-group">
      <NavbarButton
        to="/host"
        text="Host"
        icon="cloud-upload"
      />
      <NavbarButton
        to="/matches"
        text="Matches"
        icon="numbered-list"
      />
      <NavbarButton
        to="/members"
        text="Members"
        icon="user"
      />
      {/*<NavbarButton*/}
        {/*to="/ubl"*/}
        {/*text="Ban List"*/}
        {/*icon="take-action"*/}
      {/*/>*/}
    </div>
    <div className="pt-navbar-group">
      <Username />
      <Button
        className="pt-minimal"
        iconName={isDarkMode ? 'moon' : 'flash'}
        onClick={toggleDarkMode}
      />
    </div>
  </nav>
);

const stateSelector = createSelector<ApplicationState, boolean, StateProps>(
  isDarkMode,
  isDarkMode => ({
    isDarkMode,
  }),
);

export const Navbar: React.ComponentClass = withRouter<{}>(
  connect<StateProps, DispatchProps, RouteComponentProps<any>>(
    stateSelector,
    (dispatch: Dispatch<ApplicationState>): DispatchProps => ({
      toggleDarkMode: () => dispatch(SettingsActions.toggleDarkMode()),
    }),
  )(NavbarComponent),
);
