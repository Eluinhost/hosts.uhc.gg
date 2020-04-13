import { createAction } from 'typesafe-redux-helpers';
import { Modifier } from './Modifier';

export const FETCH_MODIFIERS = {
  TRIGGER: createAction('[Fetch Modifiers] Trigger'),
  STARTED: createAction('[Fetch Modifiers] Started'),
  COMPLETED: createAction('[Fetch Modifiers] Completed', (available: Modifier[]) => ({ available })),
};
