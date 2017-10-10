import { ApplicationReducer, ReducerBuilder } from './ReducerBuilder';
import * as moment from 'moment-timezone';
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

export const reducer: ApplicationReducer<AuthenticationState> = ReducerBuilder
  .withInitialState<AuthenticationState>({
    storageKey,
    accessToken: null,
    refreshToken: null,
  })
  .handle(Authentication.login, (prev, action) => ({
    storageKey: prev.storageKey,
    accessToken: action.payload!.accessToken,
    refreshToken: action.payload!.refreshToken,
  }))
  .handle(Authentication.logout, (prev, action) => ({
    storageKey: prev.storageKey,
    accessToken: null,
    refreshToken: null,
  }))
  .build();
