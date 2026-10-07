import { Menu, Button } from '@mantine/core';
import { UserIcon, GearIcon, SignOutIcon } from '@phosphor-icons/react';
import { useNavigate, Link } from '@tanstack/react-router';
import { useAtomValue } from 'jotai';
import React, { useCallback } from 'react';

import { isLoggedInAtom, usernameAtom } from '@/authentication/atoms/authentication';
import { AuthenticationApi } from '@/authentication/AuthenticationApi';
import { LoginButton } from '@/shell/components/LoginButton';

export const Username: React.FC = () => {
  const isLoggedIn = useAtomValue(isLoggedInAtom);
  const username = useAtomValue(usernameAtom);
  const { mutate: logoutSession } = AuthenticationApi.mutations.useLogout();
  const navigate = useNavigate();

  const logout = useCallback(() => {
    logoutSession(undefined, { onSettled: () => void navigate({ to: '/' }) });
  }, [logoutSession, navigate]);

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
