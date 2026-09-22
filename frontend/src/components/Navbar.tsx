import {
  Button,
  type IconName,
  type MaybeElement,
  NavbarGroup,
  NavbarHeading,
  Navbar as BpNavbar,
} from '@blueprintjs/core';
import {
  CloudUploadIcon,
  FlashIcon,
  HelpIcon,
  InboxIcon,
  MoonIcon,
  NumberedListIcon,
  UnresolveIcon,
  UserIcon,
} from '@blueprintjs/icons';
import { useAtom } from 'jotai';
import React from 'react';
import { useLocation, Link } from 'react-router';

import { isDarkModeAtom } from '../atoms/isDarkMode';

import { Username } from './Username';
import { WithPermission } from './WithPermission';

type NavBarButtonProps = {
  readonly text: string;
  readonly icon: IconName | MaybeElement;
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

export const Navbar: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useAtom(isDarkModeAtom);

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
        <NavbarButton to="/host" text="Host" icon={<CloudUploadIcon />} />
        <NavbarButton to="/matches" text="Matches" icon={<NumberedListIcon />} />
        <NavbarButton to="/host-applications" text="Host Applications" icon={<InboxIcon />} />
        <NavbarButton to="/members" text="Members" icon={<UserIcon />} />
        <WithPermission permission="hosting advisor">
          <NavbarButton text="Modifiers" icon={<UnresolveIcon />} to="/modifiers" />
        </WithPermission>
        <WithPermission permission="hosting advisor">
          <NavbarButton to="/quiz" text="Application Quiz" icon={<HelpIcon />} />
        </WithPermission>
      </NavbarGroup>
      <NavbarGroup>
        <Username />
        <Button
          variant="minimal"
          icon={isDarkMode ? <MoonIcon /> : <FlashIcon />}
          onClick={() => {
            setIsDarkMode(prev => !prev);
          }}
        />
      </NavbarGroup>
    </BpNavbar>
  );
};
