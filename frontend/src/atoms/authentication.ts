import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { jwtDecode } from 'jwt-decode';

import dayjs from '../dayjs';

export const authenticationAtom = atomWithStorage<{ accessToken: string; refreshToken: string } | null>(
  'authentication',
  null,
  undefined,
  { getOnInit: true },
);

export const accessTokenAtom = atom(get => get(authenticationAtom)?.accessToken);
export const refreshTokenAtom = atom(get => get(authenticationAtom)?.refreshToken);

export const accessTokenClaimsAtom = atom(get => {
  const token = get(accessTokenAtom);

  if (!token) {
    return undefined;
  }

  try {
    console.log('decoded again');
    const decoded = jwtDecode<{
      readonly iat: number;
      readonly exp: number;
      readonly username: string;
      readonly permissions: string[];
    }>(token);

    return {
      username: decoded.username,
      permissions: decoded.permissions,
      expires: dayjs.unix(decoded.exp),
    };
  } catch {
    return undefined;
  }
});

export const permissionsAtom = atom(get => get(accessTokenClaimsAtom)?.permissions);

export const isLoggedInAtom = atom(get => get(accessTokenClaimsAtom) !== undefined);

export const usernameAtom = atom(get => get(accessTokenClaimsAtom)?.username);

export const refreshTokenClaimsAtom = atom(get => {
  const token = get(refreshTokenAtom);

  if (!token) {
    return undefined;
  }

  try {
    const decoded = jwtDecode<{
      readonly iat: number;
      readonly exp: number;
      readonly username: string;
    }>(token);

    return {
      username: decoded.username,
      expires: dayjs.unix(decoded.exp),
    };
  } catch {
    return undefined;
  }
});

export const isHostingBannedAtom = atom(get => get(permissionsAtom)?.includes('hosting banned') ?? false);
export const isHostingAdvisorAtom = atom(get => get(permissionsAtom)?.includes('hosting advisor') ?? false);
export const isHostAtom = atom(get => get(permissionsAtom)?.includes('host') ?? false);
export const isTrialHostAtom = atom(get => get(permissionsAtom)?.includes('trial host') ?? false);

// TODO migration
// const db = window.indexedDB.open('hosts-uhcgg-data');
//
// db.onsuccess = event => {
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-member-access
//   const database = (event.target as any)?.result as IDBDatabase | undefined;
//
//   if (!database) {
//     return;
//   }
//
//   const store = database.transaction(['hosts-uhcgg-data'], 'readonly').objectStore('hosts-uhcgg-data');
//
//   store.get('settings.authentication').onsuccess = evt => {
//     console.log('db opened', evt.target?.result);
//
//     getDefaultStore().set(authenticationAtom, evt.target.result);
//   };
// };
