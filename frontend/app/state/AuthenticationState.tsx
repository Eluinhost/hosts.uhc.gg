import { Action, createAction } from 'redux-actions';
import { ReducerBuilder } from './ReducerBuilder';
import { Reducer, Store } from 'redux';
import { storage } from '../storage';
import * as decodeJwt from 'jwt-decode';
import * as moment from 'moment';
import { ThunkAction } from 'redux-thunk';
import { ApplicationState } from './ApplicationState';
import { T, F, always } from 'ramda';
import { ForbiddenError, NotAuthenticatedError, refreshTokens } from '../api/index';

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
  readonly username: string;
};

export type AuthenticationData = {
  readonly rawAccessToken: string;
  readonly rawRefreshToken: string;
  readonly accessTokenClaims: AccessTokenClaims;
  readonly refreshTokenClaims: RefreshTokenClaims;
};

export type AuthenticationState = {
  readonly loggedIn: boolean;
  readonly data: AuthenticationData | null;
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
        const refreshTokenClaims = parseRefreshTokenClaims(payload.refreshToken);

        const nextState: AuthenticationData = {
          accessTokenClaims,
          refreshTokenClaims,
          rawAccessToken: payload.accessToken,
          rawRefreshToken: payload.refreshToken,
        };

        dispatch(setLoggedInData(nextState));
        return true;
      } catch (err) {
        dispatch(AuthenticationActions.logout());
        return false;
      }
    };
  },
  logout: createAction('LOGOUT'),
  refreshIfRequired(): ThunkAction<Promise<boolean>, ApplicationState, {}> {
    return (dispatch, getState) => {
      const state = getState();

      if (!state.authentication.loggedIn)
        return Promise.resolve(false);

      const now = moment();

      // If the access token still has time left do nothing
      if (state.authentication.data!.accessTokenClaims.expires.isAfter(now.add(5 , 'minutes')))
        return Promise.resolve(false);

      // If the refresh token has expired too just log the client out
      if (state.authentication.data!.refreshTokenClaims.expires.isBefore(now.subtract(5, 'minutes'))) {
        dispatch(AuthenticationActions.logout());
        return Promise.resolve(true);
      }

      // Get new tokens from the API
      return refreshTokens(state.authentication.data!.rawRefreshToken)
        .then(data => dispatch(AuthenticationActions.login(data)))
        .then(_ => true)
        .catch((err) => {
          console.error(err);

          // force log them out if refresh token is broken
          if (err instanceof ForbiddenError || err instanceof NotAuthenticatedError) {
            dispatch(AuthenticationActions.logout());
            return Promise.resolve(false);
          }

          return Promise.reject(err);
        });
    };
  },
};

export const reducer: Reducer<AuthenticationState> = new ReducerBuilder<AuthenticationState>()
  .handleEvolve(setLoggedInData, (action: Action<AuthenticationData>) => {
    const data: AuthenticationData = action.payload!;

    storage.setItem(`${storageKey}.accessToken`, data.rawAccessToken);
    storage.setItem(`${storageKey}.refreshToken`, data.rawRefreshToken);

    return {
      loggedIn: T,
      data: always(data),
    };
  })
  .handleEvolve(AuthenticationActions.logout, () => {
    storage.removeItem(`${storageKey}.accessToken`);
    storage.removeItem(`${storageKey}.refreshToken`);

    return {
      loggedIn: F,
      data: always(null),
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
    username: decoded.username,
  };
}

export async function initialValues(): Promise<AuthenticationState> {
  try {
    const rawAccessToken = await storage.getItem<string>(`${storageKey}.accessToken`);
    const rawRefreshToken = await storage.getItem<string>(`${storageKey}.refreshToken`);

    if (!rawAccessToken || !rawRefreshToken)
      return { loggedIn: false, data: null };

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
    return { loggedIn: false, data: null };
  }
}

export function postInit(store: Store<ApplicationState>): void {
  // check every minute if we need to refresh our authentication tokens
  const recheck = () => store.dispatch(AuthenticationActions.refreshIfRequired());
  setTimeout(recheck, 1000 * 60);
  recheck();
}
