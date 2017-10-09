import { ReducerBuilder } from './ReducerBuilder';
import { Reducer, Store } from 'redux';
import { storage } from '../services/storage';
import * as moment from 'moment-timezone';
import { ApplicationState } from './ApplicationState';
import { Authentication } from '../actions';

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

export const reducer: Reducer<AuthenticationState> = new ReducerBuilder<AuthenticationState>()
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

export const initialValues = async (): Promise<AuthenticationState> => ({
  storageKey,
  accessToken: await storage.getItem<string>(`${storageKey}.accessToken`),
  refreshToken: await storage.getItem<string>(`${storageKey}.refreshToken`),
});

export const postInit = (store: Store<ApplicationState>): void  => {

};
