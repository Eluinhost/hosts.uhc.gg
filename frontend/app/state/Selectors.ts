import * as decodeJwt from 'jwt-decode';
import * as moment from 'moment-timezone';
import { ApplicationState } from './ApplicationState';
import {
  always, when, equals, complement, tryCatch, prop, ifElse, pipe, intersection, isEmpty, memoize, identity, contains,
} from 'ramda';
import { createSelector } from 'reselect';
import { AccessTokenClaims, RefreshTokenClaims } from './AuthenticationState';
import { Match } from '../models/Match';

export const isDarkMode = createSelector<ApplicationState, boolean, boolean>(
  state => state.settings.isDarkMode,
  identity,
);

export const getTimezone = createSelector<ApplicationState, string, string>(
  state => state.settings.timezone,
  identity,
);

export const is12hFormat = createSelector<ApplicationState, boolean, boolean>(
  state => state.settings.is12h,
  identity,
);

export const getTimeFormat = createSelector<ApplicationState, boolean, string>(
  is12hFormat,
  is12h => is12h ? 'h:mm A' : 'HH:mm',
);

export const shouldHideRemoved = createSelector<ApplicationState, boolean, boolean>(
  state => state.settings.hideRemoved,
  identity,
);

export const shouldShowOwnRemoved = createSelector<ApplicationState, boolean, boolean>(
  state => state.settings.showOwnRemoved,
  identity,
);

export const getTagDateTimeFormat = createSelector<ApplicationState, string, string>(
  getTimeFormat,
  timeFormat => `MMM Do ${timeFormat} z`,
);

export const getDetailsDateTimeFormat = createSelector<ApplicationState, string, string>(
  getTimeFormat,
  timeFormat => `MMM Do YYYY - ${timeFormat} z`,
);

export const getAccessToken = createSelector<ApplicationState, string | null, string | null>(
  state => state.authentication.accessToken,
  identity,
);

export const getAccessTokenClaims = createSelector<ApplicationState, string | null, AccessTokenClaims | null>(
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

export const getHostingHistoryCursor = createSelector<ApplicationState, Match[], number | undefined>(
  state => state.hostHistory.matches,
  (matches) => {
    if (matches.length === 0)
      return;

    return matches[matches.length - 1].id;
  },
);

export const getRefreshToken = createSelector<ApplicationState, string | null, string | null>(
  state => state.authentication.refreshToken,
  identity,
);

export const getRefreshTokenClaims = createSelector<ApplicationState, string | null, RefreshTokenClaims | null>(
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

export const isLoggedIn = createSelector<ApplicationState, AccessTokenClaims | null, boolean>(
  getAccessTokenClaims,
  complement(equals(null)),
);

export const getUsername = createSelector<ApplicationState, AccessTokenClaims | null, string | null>(
  getAccessTokenClaims,
  when(
    complement(equals(null)),
    prop('username'),
  ),
);

export const getPermissions = createSelector<ApplicationState, AccessTokenClaims | null, string[]>(
  getAccessTokenClaims,
  ifElse(
    equals(null),
    always([]),
    prop('permissions'),
  ),
);

const toArray = <T>(a: T | T[]): T[] => when<T | T[], T[]>(complement(Array.isArray), Array.of)(a);
const containsAny = <T>(required: T[]) => (toCheck: T[]): boolean => pipe(
  intersection(required),
  complement(isEmpty),
)(toCheck);

/**
 * Check if the user has any of the permissions, empty array/string
 * means every user passes as long as they are logged in
 */
export const matchesPermissions = memoize(
  (required: string | string[]) => createSelector<ApplicationState, boolean, string[], boolean>(
    isLoggedIn,
    getPermissions,
    (logged, perms): boolean => {
      if (!logged)
        return false;

      return isEmpty(required) || containsAny(toArray(required))(perms);
    },
  ),
);

export const getUpcomingMatches = createSelector<ApplicationState, Match[], Match[]>(
  state => state.upcoming.matches,
  identity,
);

export const getUpcomingLastUpdated = createSelector<ApplicationState, moment.Moment | null, moment.Moment | null>(
  state => state.upcoming.updated,
  identity,
);
