import { createAction } from 'typesafe-redux-helpers';

export const FETCH_VERSIONS = {
  TRIGGER: createAction('[Fetch Versions] Trigger'),
  STARTED: createAction('[Fetch Versions] Started'),
  COMPLETED: createAction('[Fetch Versions] Completed', (available: Array<string>) => ({ available })),
};
