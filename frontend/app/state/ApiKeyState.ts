import { ApplicationReducer, ReducerBuilder } from './ReducerBuilder';
import { FetchApiKey, RegenerateApiKey } from '../actions';

export type ApiKeyState = {
  readonly fetching: boolean;
  readonly error: string | null;
  readonly key: string | null;
};

export const reducer: ApplicationReducer<ApiKeyState> = ReducerBuilder
  .withInitialState<ApiKeyState>({
    fetching: false,
    error: null,
    key: null,
  })
  .handle<void>(FetchApiKey.started, (prev, action) => ({
    ...prev,
    fetching: true,
    error: null,
  }))
  .handle(FetchApiKey.success, (prev, action) => ({
    ...prev,
    fetching: false,
    error: null,
    key: action.payload!.result,
  }))
  .handle(FetchApiKey.failure, (prev, action) => ({
    ...prev,
    fetching: false,
    error: 'Failed to fetch API key from server',
  }))
  .handle(RegenerateApiKey.started, (prev, action) => ({
    ...prev,
    fetching: true,
    error: null,
  }))
  .handle(RegenerateApiKey.success, (prev, action) => ({
    ...prev,
    fetching: false,
    error: null,
    key: action.payload!.result,
  }))
  .handle(RegenerateApiKey.failure, (prev, action) => ({
    ...prev,
    fetching: false,
    error: 'Failed to fetch API key from server',
  }))
  .build();
