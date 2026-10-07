import type { QueryClient } from '@tanstack/react-query';

import { AuthenticationApi } from '@/authentication/AuthenticationApi';

export const LOGIN_ERROR_KEY = 'uhcgg.loginError';
export const LOGIN_STATE_KEY = 'uhcgg.loginState';
export const LOGIN_PATH_KEY = 'uhcgg.loginPath';

export const captureLoginRedirect = async (client: QueryClient): Promise<void> => {
  const { pathname, search } = window.location;

  if (pathname !== '/login') {
    return;
  }

  const params = new URLSearchParams(search);
  const state = params.get('state');

  const storedState = sessionStorage.getItem(LOGIN_STATE_KEY);
  sessionStorage.removeItem(LOGIN_STATE_KEY);

  let path = sessionStorage.getItem(LOGIN_PATH_KEY) ?? '/';
  sessionStorage.removeItem(LOGIN_PATH_KEY);

  if (state === null || storedState === null || state !== storedState) {
    console.log(state, storedState);
    // mismatched state key, just redirect to home and show the toast, dont touch existing keys
    sessionStorage.setItem(LOGIN_ERROR_KEY, 'Invalid login state');
    window.history.replaceState(null, '', '/');
    return;
  }

  // TODO needs to be more robust, errors bubble
  const claims = await client.query(AuthenticationApi.session);

  if (!claims) {
    sessionStorage.setItem(LOGIN_ERROR_KEY, 'Invalid login token');
    path = '/';
  }

  window.history.replaceState(null, '', path);
};
