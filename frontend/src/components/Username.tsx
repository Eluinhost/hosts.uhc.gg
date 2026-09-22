import { Button, Menu, MenuItem, PopoverNext } from '@blueprintjs/core';
import { CogIcon, LogOutIcon, UserIcon } from '@blueprintjs/icons';
import { useAtomValue, useSetAtom } from 'jotai';
import React, { useCallback } from 'react';
import { useNavigate, Link } from 'react-router';

import { authenticationAtom, isLoggedInAtom, usernameAtom } from '../atoms/authentication';

import { LoginButton } from './LoginButton';

const UserMenu: React.FunctionComponent<{ readonly logout: () => void }> = ({ logout }) => (
  <Menu>
    <Link to="/profile">
      <MenuItem icon={<CogIcon />} text="Profile" />
    </Link>
    <MenuItem icon={<LogOutIcon />} onClick={logout} text="Logout" />
  </Menu>
);

export const Username: React.FC = () => {
  const setAuthentication = useSetAtom(authenticationAtom);
  const isLoggedIn = useAtomValue(isLoggedInAtom);
  const username = useAtomValue(usernameAtom);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    setAuthentication(null);
    void navigate('/');
  }, [setAuthentication, navigate]);

  if (isLoggedIn) {
    return (
      <PopoverNext
        content={<UserMenu logout={logout} />}
        placement="bottom-end"
        renderTarget={triggerProps => (
          <Button {...triggerProps} variant="minimal" icon={<UserIcon />}>
            {username}
          </Button>
        )}
      ></PopoverNext>
    );
  }

  return <LoginButton />;
};
