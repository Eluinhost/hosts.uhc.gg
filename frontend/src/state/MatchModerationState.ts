import type { Reducer } from 'redux';
import { createReducer } from 'typesafe-redux-helpers';

import { ApproveMatch } from '../actions';

export type MatchModerationState = {
  readonly approvalModalId: number | null;
  readonly removalPending: boolean;
};

export const reducer: Reducer<MatchModerationState> = createReducer<MatchModerationState>({
  approvalModalId: null,
  removalPending: false,
})
  .handleAction(ApproveMatch.openDialog, (state, action) => ({
    ...state,
    approvalModalId: action.payload,
  }))
  .handleAction(ApproveMatch.closeDialog, state => ({
    ...state,
    approvalModalId: null,
  }));
