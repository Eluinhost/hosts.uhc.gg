import { atom } from 'jotai';

import { isHostAtom, isHostingBannedAtom, isTrialHostAtom, usernameAtom } from '../atoms/authentication';

export const canApplyToHostAtom = atom(get => {
  const username = get(usernameAtom);
  const isHostingBanned = get(isHostingBannedAtom);
  const isTrialHost = get(isTrialHostAtom);
  const isHost = get(isHostAtom);

  return !!username && !isHost && !isTrialHost && !isHostingBanned;
});
