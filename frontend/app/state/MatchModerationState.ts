import { ApplicationReducer, ReducerBuilder } from './ReducerBuilder';
import { ApproveMatch, RemoveMatch } from '../actions';

export type MatchModerationState = {
  readonly removalModalId: number | null;
  readonly approvalModalId: number | null;
};

export const reducer: ApplicationReducer<MatchModerationState> = ReducerBuilder
  .withInitialState<MatchModerationState>({
    removalModalId: null,
    approvalModalId: null,
  })
  .handle(RemoveMatch.openDialog, (prev, action) => ({
    removalModalId: action.payload!,
    approvalModalId: null,
  }))
  .handle(RemoveMatch.closeDialog, (prev, action) => ({
    removalModalId: null,
    approvalModalId: prev.approvalModalId,
  }))
  .handle(ApproveMatch.openDialog, (prev, action) => ({
    approvalModalId: action.payload!,
    removalModalId: null,
  }))
  .handle(ApproveMatch.closeDialog, (prev, action) => ({
    approvalModalId: null,
    removalModalId: prev.removalModalId,
  }))
  .build();
