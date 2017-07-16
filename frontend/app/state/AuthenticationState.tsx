import { createAction } from 'redux-actions';
import { buildReducer } from './buildReducer';
import { Reducer } from 'redux';
import { storage } from '../storage';
import * as decodeJwt from 'jwt-decode';

const storageKey = 'authentication';

export type Claims = {
  readonly username: string;
  readonly permissions: string[];
};

export type AuthenticationData = {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly claims: Claims;
};

export type AuthenticationState = {
  readonly loggedIn: boolean;
  readonly data?: AuthenticationData;
};

export const AuthenticationActions = {
  login: createAction<AuthenticationData>('LOGIN'),
  logout: createAction('LOGOUT'),
};

const notLoggedIn: AuthenticationState = {
  loggedIn: false,
};

export const reducer: Reducer<AuthenticationState> = buildReducer<AuthenticationState>()
  .handle(AuthenticationActions.login, (state, action) => {
    storage.setItem(`${storageKey}.accessToken`, action.payload!.accessToken);
    storage.setItem(`${storageKey}.refrsehToken`, action.payload!.refreshToken);

    return {
      loggedIn: true,
      data: action.payload,
    };
  })
  .handle(AuthenticationActions.logout, () => {
    storage.removeItem(storageKey);

    return notLoggedIn;
  })
  .done();

export function parseJwt(token: string): Claims {
  return decodeJwt<Claims>(token);
}

export async function initialValues(): Promise<AuthenticationState> {
  try {
    const accessToken = await storage.getItem<string>(`${storageKey}.accessToken`);
    const refreshToken = await storage.getItem<string>(`${storageKey}.refreshToken`);

    if (!accessToken || !refreshToken)
      return notLoggedIn;

    const parsed = parseJwt(accessToken);

    return {
      data: {
        accessToken,
        refreshToken,
        claims: parsed,
      },
      loggedIn: true,
    };
  } catch (err) {
    console.error(err);
    return notLoggedIn;
  }
}
