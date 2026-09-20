import { type ReadonlyAtom } from '@tanstack/react-form';
import { useState } from 'react';
import { useDispatch, useStore } from 'react-redux';
import type { ActionCreator } from 'typesafe-redux-helpers';

import { useFormSelector } from '../../forms/useAppForm';

export const usePersistence = <T>(source: ReadonlyAtom<{ values: T }>, action: ActionCreator<T, unknown, string>) => {
  const store = useStore();
  const dispatch = useDispatch();

  const [initialSavedData] = useState(() => store.getState().hostFormSavedData);

  useFormSelector(source, state => {
    // TODO debounce
    dispatch(action(state.values));
  });

  return initialSavedData;
};
