import ky from 'ky';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { getAccessToken } from './state/Selectors';

let accessToken: string | null = null;

export const apiClient = ky.create({
  hooks: {
    beforeRequest: [
      ({ request }) => {
        request.headers.set('Authorization', `Bearer ${accessToken}`);
      },
    ],
  },
});

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

/**
 * Temp to keep the client access token in sync with Redux store
 */
export const SyncApiToken = () => {
  const storeToken = useSelector(getAccessToken);

  useEffect(() => {
    setAccessToken(storeToken);
  }, [storeToken]);

  return null;
};
