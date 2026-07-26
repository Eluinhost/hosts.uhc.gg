import { ActionCreator, createReducer } from 'typesafe-redux-helpers';
import { ApiErrors } from '../api';
import { SuccessAction } from 'typesafe-redux-helpers/dist/PayloadAction';

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
    started: ActionCreator<any, StatedPayload, string>,
    startedDataTransfomer: (action: SuccessAction<StatedPayload>) => Data,
  ) => ({
    withCompletedAction: <CompletedPayload>(
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
              error: displayError('cause' in payload ? payload['cause'] : payload),
              data: initialData,
            }),
          ),
    }),
  }),
});
