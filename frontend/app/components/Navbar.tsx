import { RouteComponentProps, withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import { Button } from '@blueprintjs/core';
import * as React from 'react';
import { Username } from './Username';

type NavBarButtonProps = {
  readonly text: string;
  readonly icon: string;
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

export const Navbar: React.SFC = () => (
  <nav className="pt-navbar">
    <div className="pt-navbar-group">
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
    </div>
    <div className="pt-navbar-group">
      <Username />
    </div>
  </nav>
);
