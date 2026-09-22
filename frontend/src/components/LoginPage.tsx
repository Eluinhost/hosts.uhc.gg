import { NonIdealState } from '@blueprintjs/core';
import { WarningSignIcon } from '@blueprintjs/icons';
import { useAtomValue, useSetAtom } from 'jotai';
import qs from 'query-string';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { authenticationAtom, isLoggedInAtom } from '../atoms/authentication';

const InvalidToken: React.FunctionComponent = () => (
  <NonIdealState title="Invalid login token" icon={<WarningSignIcon />} />
);

const zeroth = (t: string | (string | null)[] | null | undefined): string | null | undefined =>
  Array.isArray(t) ? t[0] : t;

export const LoginPage: React.FC = () => {
  const loggedIn = useAtomValue(isLoggedInAtom);
  const setAuthentication = useSetAtom(authenticationAtom);
  const location = useLocation();
  const navigate = useNavigate();
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    if (loggedIn) {
      void navigate(redirectPath || '/');
    }
  }, [loggedIn, redirectPath, navigate]);

  useEffect(() => {
    const { path, token, refresh } = qs.parse(location.search);

    const redirectPath = zeroth(path);
    const accessToken = zeroth(token);
    const refreshToken = zeroth(refresh);

    if (redirectPath && accessToken && refreshToken && redirectPath.startsWith('/')) {
      setAuthentication({ accessToken, refreshToken });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRedirectPath(redirectPath);
    } else {
      console.error('Invalid token parameters', path, token, refresh);
    }
    // make sure it runs just once to match old componentDidMount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <InvalidToken />;
};
