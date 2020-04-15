import { createAction } from 'typesafe-redux-helpers';
import { Version } from './Version';

export const FETCH_VERSIONS = {
  TRIGGER: createAction('[Fetch Versions] Trigger'),
  STARTED: createAction('[Fetch Versions] Started'),
  COMPLETED: createAction('[Fetch Versions] Completed', (available: Version[]) => ({ available })),
};
