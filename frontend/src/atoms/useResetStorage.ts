import { useResetAtom } from 'jotai/utils';

import { isDarkModeAtom } from '@/atoms/isDarkMode';
import { is12hAtom } from '@/atoms/timeFormatting';
import { timezoneAtom } from '@/atoms/timezone';
import { authenticationAtom } from '@/authentication/atoms/authentication';
import { hostFormDataAtom } from '@/host/atoms/hostFormData';
import { presetsAtom } from '@/host/atoms/presets';
import { hideRemovedAtom, showOwnRemovedAtom } from '@/matches/atoms/removedMatches';

export const useResetStorage = () => {
  const atoms = [
    useResetAtom(authenticationAtom),
    useResetAtom(hostFormDataAtom),
    useResetAtom(isDarkModeAtom),
    useResetAtom(presetsAtom),
    useResetAtom(hideRemovedAtom),
    useResetAtom(showOwnRemovedAtom),
    useResetAtom(is12hAtom),
    useResetAtom(timezoneAtom),
  ];

  return () => {
    atoms.forEach(resetAtom => {
      resetAtom();
    });
    window.location.reload();
  };
};
