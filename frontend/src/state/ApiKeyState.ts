import { createReducer } from 'typesafe-redux-helpers';
import { FetchApiKey, RegenerateApiKey } from '../actions';
import { Reducer } from 'redux';

export type ApiKeyState = {
  readonly fetching: boolean;
  readonly error: string | null;
  readonly key: string | null;
};

export const reducer: Reducer<ApiKeyState> = createReducer<ApiKeyState>({
  fetching: false,
  error: null,
  key: null,
})
  .handleAction(FetchApiKey.started, state => ({
    fetching: true,
    error: null,
    key: state.key,
  }))
  .handleAction(FetchApiKey.success, (state, action) => ({
    fetching: false,
    error: null,
    key: action.payload.result,
  }))
  .handleAction(FetchApiKey.failure, state => ({
    fetching: false,
    error: 'Failed to fetch API key from server',
    key: state.key,
  }))
  .handleAction(RegenerateApiKey.started, state => ({
    fetching: true,
    error: null,
    key: state.key,
  }))
  .handleAction(RegenerateApiKey.success, (state, action) => ({
    fetching: false,
    error: null,
    key: action.payload.result,
  }))
  .handleAction(RegenerateApiKey.failure, state => ({
    fetching: false,
    error: 'Failed to fetch API key from server',
    key: state.key,
  }));
