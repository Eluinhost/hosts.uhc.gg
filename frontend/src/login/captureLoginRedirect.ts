import { getDefaultStore } from 'jotai';

import {
  accessTokenClaimsAtom,
  authenticationAtom,
  refreshTokenClaimsAtom,
} from '@/authentication/atoms/authentication';

export const LOGIN_ERROR_KEY = 'uhcgg.loginError';
export const LOGIN_STATE_KEY = 'uhcgg.loginState';
export const LOGIN_PATH_KEY = 'uhcgg.loginPath';

const HANDOFF_COOKIE_KEY = 'uhcgg_handoff';

const readHandoffCookie = (): string | null => {
  for (const cookie of document.cookie.split(';')) {
    const [name, ...value] = cookie.trim().split('=');
    if (name === HANDOFF_COOKIE_KEY) {
      return value.join('=');
    }
  }
  return null;
};

const deleteHandoffCookie = (): void => {
  document.cookie = `${HANDOFF_COOKIE_KEY}=; Path=/login; Max-Age=0`;
};

export const captureLoginRedirect = (): void => {
  const { pathname, search } = window.location;

  if (pathname !== '/login') {
    return;
  }

  const params = new URLSearchParams(search);
  const state = params.get('state');

  const handoff = readHandoffCookie();
  deleteHandoffCookie();

  const storedState = sessionStorage.getItem(LOGIN_STATE_KEY);
  sessionStorage.removeItem(LOGIN_STATE_KEY);

  let path = sessionStorage.getItem(LOGIN_PATH_KEY);
  sessionStorage.removeItem(LOGIN_PATH_KEY);

  if (state === null || storedState === null || state !== storedState) {
    console.log(state, storedState);
    // mismatched state key, just redirect to home and show the toast, dont touch existing keys
    sessionStorage.setItem(LOGIN_ERROR_KEY, 'Invalid login state');
    window.history.replaceState(null, '', '/');
    return;
  }

  if (handoff !== null) {
    const [accessToken, refreshToken] = handoff.split('~');

    if (accessToken && refreshToken) {
      getDefaultStore().set(authenticationAtom, { accessToken, refreshToken });
    }
  }

  const accessClaims = getDefaultStore().get(accessTokenClaimsAtom);
  const refreshClaims = getDefaultStore().get(refreshTokenClaimsAtom);

  if (!accessClaims || !refreshClaims) {
    console.log(accessClaims, refreshClaims, handoff);

    sessionStorage.setItem(LOGIN_ERROR_KEY, 'Invalid login token');
    getDefaultStore().set(authenticationAtom, null);
    path = '/';
  }

  window.history.replaceState(null, '', path);
};
