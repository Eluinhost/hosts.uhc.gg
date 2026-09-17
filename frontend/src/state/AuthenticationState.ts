import type { Reducer } from 'redux';
import { createReducer } from 'typesafe-redux-helpers';

import { Authentication } from '../actions';
import type { Dayjs } from '../dayjs';

// TODO move key to saga and out of state
const storageKey = 'authentication';

export type AuthenticationState = {
  readonly accessToken: string | null;
  readonly refreshToken: string | null;
  readonly storageKey: string;
};

// The 'parsed' versions with actual objects
export type AccessTokenClaims = {
  readonly expires: Dayjs;
  readonly username: string;
  readonly permissions: string[];
};
export type RefreshTokenClaims = {
  readonly expires: Dayjs;
  readonly username: string;
};

export const reducer: Reducer<AuthenticationState> = createReducer<AuthenticationState>({
  storageKey,
  accessToken: null,
  refreshToken: null,
})
  .handleAction(Authentication.login, (state, action) => ({
    storageKey: state.storageKey,
    accessToken: action.payload.accessToken,
    refreshToken: action.payload.refreshToken,
  }))
  .handleAction(Authentication.logout, state => ({
    storageKey: state.storageKey,
    accessToken: null,
    refreshToken: null,
  }));
