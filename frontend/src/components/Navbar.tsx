import { RouteComponentProps, withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import { Button, IconName, NavbarGroup, NavbarHeading, Navbar as BpNavbar } from "@blueprintjs/core";
import * as React from 'react';
import { Username } from './Username';
import { createSelector } from 'reselect';
import { ApplicationState } from '../state/ApplicationState';
import { isDarkMode } from '../state/Selectors';
import { connect, Dispatch } from 'react-redux';
import { Settings } from '../actions';
import { WithPermission } from './WithPermission';

import logo from './logo.png';

type NavBarButtonProps = {
  readonly text: string;
  readonly icon: IconName;
  readonly to: string;
};

const NavBarButtonComponent: React.SFC<NavBarButtonProps & RouteComponentProps<any>> = ({
  text,
  icon,
  to,
  location,
}) => (
  <Link to={to}>
    <Button
      minimal
      icon={icon}
      active={location.pathname === to || location.pathname.startsWith(`${to}/`)}
    >
      {text}
    </Button>
  </Link>
);

const NavbarButton: React.ComponentClass<NavBarButtonProps> = withRouter(NavBarButtonComponent);

type StateProps = {
  readonly isDarkMode: boolean;
};

type DispatchProps = {
  readonly toggleDarkMode: () => void;
};

const NavbarComponent: React.FunctionComponent<StateProps & DispatchProps> = ({ isDarkMode, toggleDarkMode }) => (
  <BpNavbar>
    <NavbarGroup>
      <Link to="/">
        <img src={logo} alt="logo" className="brand-logo" />
      </Link>
      <Link to="/">
        <NavbarHeading>uhc.gg hosting</NavbarHeading>
      </Link>
    </NavbarGroup>
    <NavbarGroup>
      <NavbarButton to="/host" text="Host" icon="cloud-upload" />
      <NavbarButton to="/matches" text="Matches" icon="numbered-list" />
      <NavbarButton to="/members" text="Members" icon="user" />
      {/*<NavbarButton*/}
      {/*to="/ubl"*/}
      {/*text="Ban List"*/}
      {/*icon="take-action"*/}
      {/*/>*/}
      <WithPermission permission="hosting advisor">
        <NavbarButton to="/hosting-alerts" text="Hosting Alerts" icon="notifications" />
      </WithPermission>
    </NavbarGroup>
    <NavbarGroup>
      <Username />
      <Button minimal icon={isDarkMode ? 'moon' : 'flash'} onClick={toggleDarkMode} />
    </NavbarGroup>
  </BpNavbar>
);

const stateSelector = createSelector<ApplicationState, boolean, StateProps>(isDarkMode, isDarkMode => ({
  isDarkMode,
}));

export const Navbar: React.ComponentClass = withRouter(
  connect<StateProps, DispatchProps, RouteComponentProps<any>>(
    stateSelector,
    (dispatch: Dispatch<ApplicationState>): DispatchProps => ({
      toggleDarkMode: () => dispatch(Settings.toggleDarkMode()),
    }),
  )(NavbarComponent),
);
