import { createReducer } from 'typesafe-redux-helpers';
import moment from 'moment-timezone';
import { Reducer } from 'redux';

import { Authentication } from '../actions';

// TODO move key to saga and out of state
const storageKey = 'authentication';

export type AuthenticationState = {
  readonly accessToken: string | null;
  readonly refreshToken: string | null;
  readonly storageKey: string;
};

// The 'parsed' versions with actual objects
export type AccessTokenClaims = {
  readonly expires: moment.Moment;
  readonly username: string;
  readonly permissions: string[];
};
export type RefreshTokenClaims = {
  readonly expires: moment.Moment;
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
