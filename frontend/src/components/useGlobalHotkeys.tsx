import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useHotkeys } from '@blueprintjs/core';

export const useGlobalHotkeys = () => {
  const navigate = useNavigate();

  const hotkeys = useMemo(
    () => [
      {
        combo: 'H',
        global: true,
        label: 'Create a new match',
        onKeyDown: () => navigate('/host'),
      },
      {
        combo: 'M',
        global: true,
        label: 'Go to match listing',
        onKeyDown: () => navigate('/matches'),
      },
      {
        combo: 'P',
        global: true,
        label: 'Go to permissions',
        onKeyDown: () => navigate('/members'),
      },
      {
        combo: 'backspace',
        global: true,
        label: 'Go back',
        onKeyDown: () => navigate(-1),
      },
    ],
    [navigate],
  );

  useHotkeys(hotkeys);
};
