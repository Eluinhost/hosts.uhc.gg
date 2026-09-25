import { Menu, Button } from '@mantine/core';
import { UserIcon, GearIcon, SignOutIcon } from '@phosphor-icons/react';
import { useAtomValue, useSetAtom } from 'jotai';
import React, { useCallback } from 'react';
import { useNavigate, Link } from 'react-router';

import { authenticationAtom, isLoggedInAtom, usernameAtom } from '../atoms/authentication';

import { LoginButton } from './LoginButton';

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
      <Menu trigger="click-hover">
        <Menu.Target>
          <Button variant="minimal" leftSection={<UserIcon />}>
            {username}
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item leftSection={<GearIcon />} component={Link} to="/profile">
            Profile
          </Menu.Item>
          <Menu.Item leftSection={<SignOutIcon />} onClick={logout}>
            Logout
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    );
  }

  return <LoginButton />;
};
