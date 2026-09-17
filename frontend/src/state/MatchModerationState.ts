import type { Reducer } from 'redux';
import { createReducer } from 'typesafe-redux-helpers';

import { ApproveMatch, RemoveMatch } from '../actions';

export type MatchModerationState = {
  readonly removalModalId: number | null;
  readonly approvalModalId: number | null;
};

export const reducer: Reducer<MatchModerationState> = createReducer<MatchModerationState>({
  removalModalId: null,
  approvalModalId: null,
})
  .handleAction(RemoveMatch.openDialog, (_state, action) => ({
    removalModalId: action.payload,
    approvalModalId: null,
  }))
  .handleAction(RemoveMatch.closeDialog, state => ({
    removalModalId: null,
    approvalModalId: state.approvalModalId,
  }))
  .handleAction(ApproveMatch.openDialog, (_state, action) => ({
    approvalModalId: action.payload,
    removalModalId: null,
  }))
  .handleAction(ApproveMatch.closeDialog, state => ({
    approvalModalId: null,
    removalModalId: state.removalModalId,
  }));
