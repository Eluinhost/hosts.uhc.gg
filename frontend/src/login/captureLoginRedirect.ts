import { getDefaultStore } from 'jotai';

import {
  accessTokenClaimsAtom,
  authenticationAtom,
  refreshTokenClaimsAtom,
} from '@/authentication/atoms/authentication';

export const LOGIN_ERROR_KEY = 'uhcgg.loginError';

const isSafeRedirectPath = (path: string | null): path is string =>
  path !== null && path.startsWith('/') && !path.startsWith('//');

// TODO oauth state management so only valid redirects can trigger the logic
export const captureLoginRedirect = (): void => {
  const { pathname, search } = window.location;

  if (pathname !== '/login') {
    return;
  }

  const params = new URLSearchParams(search);
  let path = params.get('path');
  const accessToken = params.get('token');
  const refreshToken = params.get('refresh');

  if (accessToken && refreshToken) {
    getDefaultStore().set(authenticationAtom, { accessToken, refreshToken });
  }

  const accessClaims = getDefaultStore().get(accessTokenClaimsAtom);
  const refreshClaims = getDefaultStore().get(refreshTokenClaimsAtom);

  if (!accessClaims || !refreshClaims) {
    sessionStorage.setItem(LOGIN_ERROR_KEY, 'Invalid login token');
    getDefaultStore().set(authenticationAtom, null);
    // override path to root if tokens were invalid, could be targetted link or authenticated route
    path = '/';
  }

  window.history.replaceState(null, '', isSafeRedirectPath(path) ? path : '/');
};
