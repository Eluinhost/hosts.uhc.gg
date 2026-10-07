import { atom } from 'jotai';

export interface SessionClaims {
  username: string;
  permissions: string[];
}

export const sessionAtom = atom<SessionClaims | null>(null);

export const permissionsAtom = atom(get => get(sessionAtom)?.permissions);

export const isLoggedInAtom = atom(get => get(sessionAtom) !== null);

export const usernameAtom = atom(get => get(sessionAtom)?.username);

export const isHostingBannedAtom = atom(get => get(permissionsAtom)?.includes('hosting banned') ?? false);
export const isHostingAdvisorAtom = atom(get => get(permissionsAtom)?.includes('hosting advisor') ?? false);
export const isHostAtom = atom(get => get(permissionsAtom)?.includes('host') ?? false);
export const isTrialHostAtom = atom(get => get(permissionsAtom)?.includes('trial host') ?? false);
