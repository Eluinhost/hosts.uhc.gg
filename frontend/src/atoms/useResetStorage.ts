import { useResetAtom } from 'jotai/utils';

import { hostFormDataAtom } from '../host/atoms/hostFormData';

import { authenticationAtom } from './authentication';
import { isDarkModeAtom } from './isDarkMode';
import { presetsAtom } from './presets';
import { hideRemovedAtom, showOwnRemovedAtom } from './removedMatches';
import { is12hAtom } from './timeFormatting';
import { timezoneAtom } from './timezone';

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
