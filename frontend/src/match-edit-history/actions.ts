import { createAction } from 'typesafe-redux-helpers';
import { Match } from '../models/Match';

export const FETCH_MATCH_EDIT_HISTORY = {
  TRIGGER: createAction('[Fetch match edit history] Trigger', (id: number) => ({ id })),
  STARTED: createAction('[Fetch match edit history] Started', (id: number) => ({ id })),
  COMPLETED: createAction('[Fetch match edit history] Completed', (history: Match[]) => ({ history })),
};
