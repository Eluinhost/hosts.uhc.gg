import { getDefaultStore } from 'jotai';
import ky from 'ky';

import { accessTokenAtom } from './atoms/authentication';

const store = getDefaultStore();

export const apiClient = ky.create({
  hooks: {
    beforeRequest: [
      ({ request }) => {
        request.headers.set('Authorization', `Bearer ${store.get(accessTokenAtom)}`);
      },
    ],
  },
});
