import { Anchor, Button } from '@mantine/core';
import { UserIcon } from '@phosphor-icons/react';
import React from 'react';
import { useLocation } from 'react-router';

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
