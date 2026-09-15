import { AnchorButton } from '@blueprintjs/core';
import { UserIcon } from '@blueprintjs/icons';
import React from 'react';
import { useLocation } from 'react-router';

export const LoginButton: React.FC = () => {
  const location = useLocation();

  return (
    <AnchorButton
      variant="minimal"
      icon={<UserIcon />}
      href={`/authenticate?path=${encodeURIComponent(location.pathname)}`}
    >
      Log In
    </AnchorButton>
  );
};
