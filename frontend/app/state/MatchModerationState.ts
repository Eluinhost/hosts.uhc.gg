import { ReducerBuilder } from './ReducerBuilder';
import { Reducer } from 'redux';
import { ApproveMatch, RemoveMatch } from '../actions';

export type MatchModerationState = {
  readonly removalModalId: number | null;
  readonly approvalModalId: number | null;
};

export const reducer: Reducer<MatchModerationState> =
  new ReducerBuilder<MatchModerationState>()
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

export const initialValues = async (): Promise<MatchModerationState> => ({
  removalModalId: null,
  approvalModalId: null,
});
