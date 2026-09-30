import { Anchor, Button } from '@mantine/core';
import { UserIcon } from '@phosphor-icons/react';
import { useLocation } from '@tanstack/react-router';
import React from 'react';

export const LoginButton: React.FC = () => {
  const location = useLocation();

  return (
    <Anchor href={`/authenticate?path=${encodeURIComponent(location.pathname)}`}>
      <Button variant="minimal" leftSection={<UserIcon />}>
        Log In
      </Button>
    </Anchor>
  );
};
