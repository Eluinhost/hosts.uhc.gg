import { createAction } from 'redux-actions';
import { buildReducer } from './buildReducer';
import { Reducer } from 'redux';
import { storage } from '../storage';
import * as decodeJwt from 'jwt-decode';

const storageKey = 'raw-jwt-token';

export type Claims = {
  readonly username: string;
  readonly permissions: string[];
};

export type AuthenticationData = {
  readonly raw: string;
  readonly claims: Claims;
};

export type AuthenticationState = {
  readonly loggedIn: boolean;
  readonly data?: AuthenticationData;
};

export const login = createAction<AuthenticationData>('LOGIN');
export const logout = createAction('LOGOUT');

const notLoggedIn: AuthenticationState = {
  loggedIn: false,
};

export const reducer: Reducer<AuthenticationState> = buildReducer<AuthenticationState>()
  .handle(login, (state, action) => {
    storage.setItem(storageKey, action.payload!.raw);

    return {
      loggedIn: true,
      data: action.payload,
    };
  })
  .handle(logout, () => {
    storage.removeItem(storageKey);

    return notLoggedIn;
  })
  .done();

export function parseJwt(token: string): Claims {
  return decodeJwt<Claims>(token);
}

export async function initialValues(): Promise<AuthenticationState> {
  try {
    const raw = await storage.getItem<string>(storageKey);

    if (!raw)
      return notLoggedIn;

    const parsed = parseJwt(raw);

    return {
      data: {
        raw,
        claims: parsed,
      },
      loggedIn: true,
    };
  } catch (err) {
    console.error(err);
    return notLoggedIn;
  }
}
