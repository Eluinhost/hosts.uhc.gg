import { Action, createAction } from 'redux-actions';
import { ReducerBuilder } from './ReducerBuilder';
import { Reducer } from 'redux';
import { storage } from '../storage';
import * as decodeJwt from 'jwt-decode';
import * as moment from 'moment';
import { ThunkAction } from 'redux-thunk';
import { ApplicationState } from './ApplicationState';
import { T, F, always } from 'ramda';

const storageKey = 'authentication';

type RawClaims = {
  readonly iat: number;
  readonly exp: number;
};

type RawRefreshTokenClaims = RawClaims & {
  readonly username: string;
};

type RawAccessTokenClaims = RawClaims & {
  readonly username: string;
  readonly permissions: string[];
};

export type AccessTokenClaims = {
  readonly expires: moment.Moment;
  readonly username: string;
  readonly permissions: string[];
};

export type RefreshTokenClaims = {
  readonly expires: moment.Moment;
};

export type AuthenticationData = {
  readonly rawAccessToken: string;
  readonly rawRefreshToken: string;
  readonly accessTokenClaims: AccessTokenClaims;
  readonly refreshTokenClaims: RefreshTokenClaims;
};

export type AuthenticationState = {
  readonly loggedIn: boolean;
  readonly data?: AuthenticationData;
};

export type LoginPayload = {
  readonly accessToken: string;
  readonly refreshToken: string;
};

const setLoggedInData = createAction<AuthenticationData>('SET_LOGGED_IN_DATA');

export const AuthenticationActions = {
  login(payload: LoginPayload): ThunkAction<boolean, ApplicationState, LoginPayload> {
    return (dispatch) => {
      try {
        const accessTokenClaims = parseAccessTokenClaims(payload.accessToken);
        const refreshTokenClaims = parseAccessTokenClaims(payload.accessToken);

        const nextState: AuthenticationData = {
          accessTokenClaims,
          refreshTokenClaims,
          rawAccessToken: payload.accessToken,
          rawRefreshToken: payload.refreshToken,
        };

        dispatch(setLoggedInData(nextState));
        return true;
      } catch (err) {
        return false;
      }
    };
  },
  logout: createAction('LOGOUT'),
};

export const reducer: Reducer<AuthenticationState> = new ReducerBuilder<AuthenticationState>()
  .handleEvolve(setLoggedInData, (action: Action<AuthenticationData>) => {
    storage.setItem(`${storageKey}.accessToken`, action.payload!.rawAccessToken);
    storage.setItem(`${storageKey}.refreshToken`, action.payload!.rawRefreshToken);

    return {
      loggedIn: T,
      data: always(action.payload),
    };
  })
  .handleEvolve(AuthenticationActions.logout, () => {
    storage.removeItem(`${storageKey}.accessToken`);
    storage.removeItem(`${storageKey}.refreshToken`);

    return {
      loggedIn: F,
      data: always(undefined),
    };
  })
  .build();

export function parseAccessTokenClaims(token: string): AccessTokenClaims {
  const decoded = decodeJwt<RawAccessTokenClaims>(token);

  return {
    username: decoded.username,
    permissions: decoded.permissions,
    expires: moment(decoded.exp, 'X'),
  };
}

export function parseRefreshTokenClaims(token: string): RefreshTokenClaims {
  const decoded = decodeJwt<RawRefreshTokenClaims>(token);

  return {
    expires: moment(decoded.exp, 'X'),
  };
}

export async function initialValues(): Promise<AuthenticationState> {
  try {
    const rawAccessToken = await storage.getItem<string>(`${storageKey}.accessToken`);
    const rawRefreshToken = await storage.getItem<string>(`${storageKey}.refreshToken`);

    if (!rawAccessToken || !rawRefreshToken)
      return { loggedIn: false };

    const accessTokenClaims = parseAccessTokenClaims(rawAccessToken);
    const refreshTokenClaims = parseRefreshTokenClaims(rawRefreshToken);

    return {
      data: {
        rawAccessToken,
        rawRefreshToken,
        accessTokenClaims,
        refreshTokenClaims,
      },
      loggedIn: true,
    };
  } catch (err) {
    console.error(err);
    return { loggedIn: false };
  }
}
