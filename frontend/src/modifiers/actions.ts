import { createAction } from 'typesafe-redux-helpers';
import { Modifier } from './Modifier';

export const FETCH_MODIFIERS = {
  TRIGGER: createAction('[Fetch Modifiers] Trigger'),
  STARTED: createAction('[Fetch Modifiers] Started'),
  COMPLETED: createAction('[Fetch Modifiers] Completed', (available: Modifier[]) => ({ available })),
};

export const DELETE_MODIFIER = {
  TRIGGER: createAction('[Delete Modifier] Trigger', (id: number) => ({ id })),
  STARTED: createAction('[Delete Modifier] Started', (id: number) => ({ id })),
  COMPLETED: createAction('[Delete Modifier] Completed', (id: number) => ({ id })),
};

export const CREATE_MODIFIER = {
  TRIGGER: createAction('[Create Modifier] Trigger', (name: string) => ({ name })),
  STARTED: createAction('[Create Modifier] Started', (name: string) => ({ name })),
  COMPLETED: createAction('[Create Modifier] Completed', (modifier: Modifier) => ({ modifier })),
};
