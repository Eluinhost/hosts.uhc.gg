import React from 'react';
import { useLocation } from 'react-router';
import { AnchorButton } from '@blueprintjs/core';

export const LoginButton: React.FC = () => {
  const location = useLocation();

  return (
    <AnchorButton minimal icon="user" href={`/authenticate?path=${encodeURIComponent(location.pathname)}`}>
      Log In
    </AnchorButton>
  );
};
