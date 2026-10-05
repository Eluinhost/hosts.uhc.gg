import { EmptyState } from '@mantine/core';
import { WarningIcon } from '@phosphor-icons/react';
import { useNavigate } from '@tanstack/react-router';
import { useAtomValue, useSetAtom } from 'jotai';
import React, { useEffect, useState } from 'react';

import { authenticationAtom, isLoggedInAtom } from '@/authentication/atoms/authentication';

const InvalidToken: React.FunctionComponent = () => <EmptyState title="Invalid login token" icon={<WarningIcon />} />;

export interface LoginPageProps {
  path: string | null;
  accessToken: string | null;
  refreshToken: string | null;
}

export const LoginPage = ({ path, accessToken, refreshToken }: LoginPageProps) => {
  const loggedIn = useAtomValue(isLoggedInAtom);
  const setAuthentication = useSetAtom(authenticationAtom);
  const navigate = useNavigate();
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    if (loggedIn) {
      void navigate({ to: redirectPath || '/', replace: true });
    }
  }, [loggedIn, redirectPath, navigate]);

  useEffect(() => {
    if (path && accessToken && refreshToken && path.startsWith('/')) {
      setAuthentication({ accessToken, refreshToken });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRedirectPath(path);
    } else {
      console.error('Invalid token parameters', path, accessToken, refreshToken);
    }
    // make sure it runs just once to match old componentDidMount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <InvalidToken />;
};
