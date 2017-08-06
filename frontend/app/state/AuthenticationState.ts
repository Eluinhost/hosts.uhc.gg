import { createAction } from 'redux-actions';
import { ReducerBuilder } from './ReducerBuilder';
import { Reducer, Store } from 'redux';
import { storage } from '../storage';
import * as moment from 'moment';
import { ThunkAction } from 'redux-thunk';
import { ApplicationState } from './ApplicationState';
import { ForbiddenError, NotAuthenticatedError, refreshTokens } from '../api/index';
import { getAccessTokenClaims, getRefreshTokenClaims, isLoggedIn } from './Selectors';

const storageKey = 'authentication';

export type AuthenticationState = {
  readonly accessToken: string | null;
  readonly refreshToken: string | null;
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

export type LoginPayload = {
  readonly accessToken: string;
  readonly refreshToken: string;
};

const clearTokens = createAction('CLEAR_LOGIN_TOKENS');

export const AuthenticationActions = {
  login: createAction<LoginPayload>('SET_LOGIN_TOKENS'),
  logout: (): ThunkAction<void, ApplicationState, {}> => (dispatch) => {
    storage.removeItem(`${storageKey}.accessToken`);
    storage.removeItem(`${storageKey}.refreshToken`);

    dispatch(clearTokens());
  },
  refreshIfRequired: (): ThunkAction<Promise<boolean>, ApplicationState, {}> =>
    async (dispatch, getState): Promise<boolean> => {
      const state = getState();

      console.log('Checking authentication token refresh status');

      if (!isLoggedIn(state)) {
        console.log('Not logged in');
        return false;
      }

      const now = moment();

      // If the access token still has time left do nothing
      if (getAccessTokenClaims(state)!.expires.isAfter(now.add(5 , 'minutes'))) {
        console.log('Authentication token not stale');
        return false;
      }

      const refreshClaims = getRefreshTokenClaims(state);

      // If the refresh token has expired too just log the client out
      if (!refreshClaims || refreshClaims.expires.isBefore(now.subtract(5, 'minutes'))) {
        console.log('Authentication + Refresh token stale, logging out');
        dispatch(AuthenticationActions.logout());
        return true;
      }

      try {
        // refresh token mustn't be null here as refreshClaims worked
        const data = await refreshTokens(state.authentication.refreshToken || 'ERROR NO REFRESH TOKEN IN STATE');
        dispatch(AuthenticationActions.login(data));

        console.log('Authentication tokens refreshed');
        return true;
      } catch (err) {
        console.error(err);

        // force log them out if refresh token is broken
        if (err instanceof ForbiddenError || err instanceof NotAuthenticatedError) {
          dispatch(AuthenticationActions.logout());
          return false;
        }

        throw err;
      }
    },
};

export const reducer: Reducer<AuthenticationState> = new ReducerBuilder<AuthenticationState>()
  .handle(AuthenticationActions.login, (state, action) => action.payload!)
  .handle(clearTokens, () => ({
    accessToken: null,
    refreshToken: null,
  }))
  .build();

export const initialValues = async (): Promise<AuthenticationState> => ({
  accessToken: await storage.getItem<string>(`${storageKey}.accessToken`),
  refreshToken: await storage.getItem<string>(`${storageKey}.refreshToken`),
});

export const postInit = (store: Store<ApplicationState>): void  => {
  // check every minute if we need to refresh our authentication tokens
  const recheck = (): void => {
    store.dispatch(AuthenticationActions.refreshIfRequired());
  };

  setInterval(recheck, 1000 * 60);
  recheck();
};
