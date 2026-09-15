import { Button, type IconName, NavbarGroup, NavbarHeading, Navbar as BpNavbar } from '@blueprintjs/core';
import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, Link } from 'react-router';
import { createSelector } from 'reselect';

import { Settings } from '../actions';
import { isDarkMode } from '../state/Selectors';

import { Username } from './Username';
import { WithPermission } from './WithPermission';

type NavBarButtonProps = {
  readonly text: string;
  readonly icon: IconName;
  readonly to: string;
};

const NavBarButtonComponent: React.FC<NavBarButtonProps> = ({ text, icon, to }) => {
  const location = useLocation();

  return (
    <Link to={to}>
      <Button variant="minimal" icon={icon} active={location.pathname === to || location.pathname.startsWith(`${to}/`)}>
        {text}
      </Button>
    </Link>
  );
};

const NavbarButton: React.FC<NavBarButtonProps> = NavBarButtonComponent;

const stateSelector = createSelector(isDarkMode, isDarkMode => ({
  isDarkMode,
}));

export const Navbar: React.FC = () => {
  const { isDarkMode } = useSelector(stateSelector);
  const dispatch = useDispatch();

  const toggleDarkMode = useCallback(() => dispatch(Settings.toggleDarkMode()), [dispatch]);

  return (
    <BpNavbar>
      <NavbarGroup>
        <Link to="/">
          <img src="/logo.png" alt="logo" className="brand-logo" />
        </Link>
        <Link to="/">
          <NavbarHeading>uhc.gg hosting</NavbarHeading>
        </Link>
      </NavbarGroup>
      <NavbarGroup>
        <NavbarButton to="/host" text="Host" icon="cloud-upload" />
        <NavbarButton to="/matches" text="Matches" icon="numbered-list" />
        <NavbarButton to="/host-applications" text="Host Applications" icon="inbox" />
        <NavbarButton to="/members" text="Members" icon="user" />
        <WithPermission permission="hosting advisor">
          <NavbarButton text="Modifiers" icon="unresolve" to="/modifiers" />
        </WithPermission>
        <WithPermission permission="hosting advisor">
          <NavbarButton to="/quiz" text="Application Quiz" icon="help" />
        </WithPermission>
      </NavbarGroup>
      <NavbarGroup>
        <Username />
        <Button variant="minimal" icon={isDarkMode ? 'moon' : 'flash'} onClick={toggleDarkMode} />
      </NavbarGroup>
    </BpNavbar>
  );
};
