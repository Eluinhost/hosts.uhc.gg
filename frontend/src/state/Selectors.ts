import decodeJwt from 'jwt-decode';
import moment from 'moment-timezone';
import { ApplicationState } from './ApplicationState';
import {
  always,
  when,
  equals,
  complement,
  tryCatch,
  intersection,
  isEmpty,
  memoizeWith,
  toString,
  identity,
} from 'ramda';
import { createSelector, Selector } from 'reselect';
import { AccessTokenClaims, RefreshTokenClaims } from './AuthenticationState';
import { Match } from '../models/Match';

export const isDarkMode: Selector<ApplicationState, boolean> = createSelector(
  state => state.settings.isDarkMode,
  identity,
);

export const getTimezone: Selector<ApplicationState, string> = createSelector(
  state => state.settings.timezone,
  identity,
);

export const is12hFormat: Selector<ApplicationState, boolean> = createSelector(state => state.settings.is12h, identity);

export const getTimeFormat: Selector<ApplicationState, string> = createSelector(is12hFormat, is12h =>
  is12h ? 'h:mm A' : 'HH:mm',
);

export const shouldHideRemoved: Selector<ApplicationState, boolean> = createSelector(
  state => state.settings.hideRemoved,
  identity,
);

export const shouldShowOwnRemoved: Selector<ApplicationState, boolean> = createSelector(
  state => state.settings.showOwnRemoved,
  identity,
);

export const getTagDateTimeFormat: Selector<ApplicationState, string> = createSelector(
  getTimeFormat,
  timeFormat => `MMM Do ${timeFormat} z`,
);

export const getDetailsDateTimeFormat: Selector<ApplicationState, string> = createSelector(
  getTimeFormat,
  timeFormat => `MMM Do YYYY - ${timeFormat} z`,
);

export const getAccessToken: Selector<ApplicationState, string | null> = createSelector(
  state => state.authentication.accessToken,
  identity,
);

export const getAccessTokenClaims: Selector<ApplicationState, AccessTokenClaims | null> = createSelector(
  getAccessToken,
  when(
    complement(equals(null)), // if it's null just pass it along, otherwise try to parse
    tryCatch(
      (token: string) => {
        const decoded = decodeJwt<{
          readonly iat: number;
          readonly exp: number;
          readonly username: string;
          readonly permissions: string[];
        }>(token);

        return {
          username: decoded.username,
          permissions: decoded.permissions,
          expires: moment(decoded.exp, 'X'),
        };
      },
      always(null), // return null on any parse errors
    ),
  ),
);

export const getHostingHistoryCursor: Selector<ApplicationState, number | undefined> = createSelector(
  state => state.hostHistory.matches,
  matches => {
    if (matches.length === 0) return;

    return matches[matches.length - 1].id;
  },
);

export const getRefreshToken: Selector<ApplicationState, string | null> = createSelector(
  state => state.authentication.refreshToken,
  identity,
);

export const getRefreshTokenClaims: Selector<ApplicationState, RefreshTokenClaims | null> = createSelector(
  getRefreshToken,
  when(
    complement(equals(null)), // if it's null just pass it along, otherwise try to parse
    tryCatch(
      (token: string) => {
        const decoded = decodeJwt<{
          readonly iat: number;
          readonly exp: number;
          readonly username: string;
        }>(token);

        return {
          username: decoded.username,
          expires: moment(decoded.exp, 'X'),
        };
      },
      always(null), // return null on any parse errors
    ),
  ),
);

export const isLoggedIn: Selector<ApplicationState, boolean> = createSelector(getAccessTokenClaims, claims => !!claims);

export const getUsername: Selector<ApplicationState, string | null> = createSelector(getAccessTokenClaims, claims =>
  claims ? claims.username : null,
);

export const getPermissions: Selector<ApplicationState, string[]> = createSelector(getAccessTokenClaims, claims =>
  claims ? claims.permissions : [],
);

const toArray = <T>(a: T | T[]): T[] => (Array.isArray(a) ? a : [a]);
const containsAny = <T>(required: T[]) => (toCheck: T[]): boolean => intersection(required, toCheck).length > 0;

/**
 * Check if the user has any of the permissions, empty array/string
 * means every user passes as long as they are logged in
 */
export const matchesPermissions: (required: string | string[]) => Selector<ApplicationState, boolean> = memoizeWith(
  toString,
  (required: string | string[]) =>
    createSelector<ApplicationState, boolean, string[], boolean>(
      isLoggedIn,
      getPermissions,
      (logged, perms): boolean => {
        if (!logged) return false;

        return isEmpty(required) || containsAny(toArray(required))(perms);
      },
    ),
);

export const getUpcomingMatches: Selector<ApplicationState, Match[]> = createSelector(
  state => state.upcoming.matches,
  identity,
);

export const getUpcomingLastUpdated: Selector<ApplicationState, moment.Moment | null> = createSelector(
  state => state.upcoming.updated,
  identity,
);
