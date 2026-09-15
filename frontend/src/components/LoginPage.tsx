import { NonIdealState } from '@blueprintjs/core';
import qs from 'query-string';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';
import { createSelector } from 'reselect';

import { Authentication, LoginPayload } from '../actions';
import { isLoggedIn } from '../state/Selectors';

const InvalidToken: React.FunctionComponent = () => <NonIdealState title="Invalid login token" icon="warning-sign" />;

const zeroth = (t: string | (string | null)[] | null | undefined): string | null | undefined =>
  Array.isArray(t) ? t[0] : t;

const stateSelector = createSelector(isLoggedIn, loggedIn => ({
  loggedIn,
}));

export const LoginPage: React.FC = () => {
  const { loggedIn } = useSelector(stateSelector);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  const login = useCallback((data: LoginPayload) => dispatch(Authentication.login(data)), [dispatch]);

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
      login({ accessToken, refreshToken });
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
