import { type ActionCreator, createReducer } from 'typesafe-redux-helpers';
import type { SuccessAction } from 'typesafe-redux-helpers/dist/PayloadAction';

import { ApiErrors } from '../api';

export interface BasicApiCallState<T> {
  isFetching: boolean;
  error: string | null;
  data: T;
}

export const displayError = (err: Error) => {
  if (err instanceof ApiErrors.NotAuthenticatedError) return 'You are not logged in';

  if (err instanceof ApiErrors.ForbiddenError) return 'You do not have permissions to do this';

  return 'Unexpected response from the server';
};

export const createBasicApiCallReducer = <Data>(initialData: Data) => ({
  withStartedAction: <StatedPayload>(
    // both never + unknown cause cascading issues, leaving as-is for now as this would be replaced (eventually)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    started: ActionCreator<any, StatedPayload, string>,
    startedDataTransfomer: (action: SuccessAction<StatedPayload>) => Data,
  ) => ({
    withCompletedAction: <CompletedPayload>(
      // both never + unknown cause cascading issues, leaving as-is for now as this would be replaced (eventually)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      completed: ActionCreator<any, CompletedPayload, string>,
      completedDataTransfomer: (action: SuccessAction<CompletedPayload>) => Data,
    ) => ({
      build: () =>
        createReducer<BasicApiCallState<Data>>({ isFetching: false, error: null, data: initialData })
          .handleAction(started, (_, action) => ({
            isFetching: true,
            error: null,
            data: startedDataTransfomer(action),
          }))
          .handleAction(
            completed,
            (_, action) => ({
              isFetching: false,
              error: null,
              data: completedDataTransfomer(action),
            }),
            (_, { payload }) => ({
              isFetching: false,
              error: displayError('cause' in payload ? (payload['cause'] as Error) : payload),
              data: initialData,
            }),
          ),
    }),
  }),
});
