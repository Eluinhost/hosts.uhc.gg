import { Button } from '@mantine/core';
import { UserIcon } from '@phosphor-icons/react';
import { useLocation } from '@tanstack/react-router';

import { LOGIN_PATH_KEY, LOGIN_STATE_KEY } from '@/login/captureLoginRedirect';

export const LoginButton = ({ label }: { label?: string }) => {
  const location = useLocation();

  const startLogin = (): void => {
    const state = crypto.randomUUID();
    sessionStorage.setItem(LOGIN_STATE_KEY, state);
    sessionStorage.setItem(LOGIN_PATH_KEY, location.pathname);
    window.location.href = `/authenticate?state=${state}`;
  };

  return (
    <Button variant="minimal" leftSection={<UserIcon />} onClick={startLogin}>
      {label ?? 'Log In'}
    </Button>
  );
};
