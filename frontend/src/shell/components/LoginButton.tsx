import { Anchor, Button } from '@mantine/core';
import { UserIcon } from '@phosphor-icons/react';
import { useLocation } from '@tanstack/react-router';

export const LoginButton = ({ label }: { label?: string }) => {
  const location = useLocation();

  return (
    <Anchor href={`/authenticate?path=${encodeURIComponent(location.pathname)}`}>
      <Button variant="minimal" leftSection={<UserIcon />}>
        {label ?? 'Log In'}
      </Button>
    </Anchor>
  );
};
