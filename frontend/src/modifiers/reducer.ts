import { createReducer } from 'typesafe-redux-helpers';

import { Modifier } from './Modifier';
import { FETCH_MODIFIERS } from './actions';

export type ModifiersState = {
  isFetching: boolean;
  error: Error | null;
  available: Modifier[];
};

export const reducer = createReducer<ModifiersState>({
  isFetching: false,
  error: null,
  available: [],
})
  .handleAction(FETCH_MODIFIERS.STARTED, () => ({
    isFetching: true,
    error: null,
    available: [],
  }))
  .handleAction(
    FETCH_MODIFIERS.COMPLETED,
    (state, action) => ({
      isFetching: false,
      error: null,
      available: action.payload.available,
    }),
    (state, action) => ({
      isFetching: false,
      error: action.payload,
      available: [],
    }),
  );
