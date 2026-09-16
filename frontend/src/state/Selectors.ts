import { jwtDecode } from 'jwt-decode';
import { intersection, isEmpty, memoizeWith, toString, identity } from 'ramda';
import { createSelector } from 'reselect';

import dayjs from '../dayjs';

import type { ApplicationState } from './ApplicationState';

export const isDarkMode = createSelector((state: ApplicationState) => state.settings.isDarkMode, identity);

export const getTimezone = createSelector((state: ApplicationState) => state.settings.timezone, identity);

export const is12hFormat = createSelector((state: ApplicationState) => state.settings.is12h, identity);

export const getTimeFormat = createSelector(is12hFormat, is12h => (is12h ? 'h:mm A' : 'HH:mm'));

export const shouldHideRemoved = createSelector((state: ApplicationState) => state.settings.hideRemoved, identity);

export const shouldShowOwnRemoved = createSelector(
  (state: ApplicationState) => state.settings.showOwnRemoved,
  identity,
);

export const getTagDateTimeFormat = createSelector(getTimeFormat, timeFormat => `MMM Do ${timeFormat} z`);

export const getDetailsDateTimeFormat = createSelector(getTimeFormat, timeFormat => `MMM Do YYYY - ${timeFormat} z`);

export const getAccessToken = createSelector((state: ApplicationState) => state.authentication.accessToken, identity);

export const getAccessTokenClaims = createSelector(getAccessToken, token => {
  if (!token) {
    return null;
  }

  try {
    const decoded = jwtDecode<{
      readonly iat: number;
      readonly exp: number;
      readonly username: string;
      readonly permissions: string[];
    }>(token);

    return {
      username: decoded.username,
      permissions: decoded.permissions,
      expires: dayjs.unix(decoded.exp),
    };
  } catch {
    return null;
  }
});

export const getHostingHistoryCursor = createSelector(
  (state: ApplicationState) => state.hostHistory.matches,
  matches => {
    if (matches.length === 0) return;

    return matches[matches.length - 1].id;
  },
);

export const getRefreshToken = createSelector((state: ApplicationState) => state.authentication.refreshToken, identity);

export const getRefreshTokenClaims = createSelector(getRefreshToken, token => {
  if (!token) {
    return null;
  }

  try {
    const decoded = jwtDecode<{
      readonly iat: number;
      readonly exp: number;
      readonly username: string;
    }>(token);

    return {
      username: decoded.username,
      expires: dayjs.unix(decoded.exp),
    };
  } catch {
    return null;
  }
});

export const isLoggedIn = createSelector(getAccessTokenClaims, claims => !!claims);

export const getUsername = createSelector(getAccessTokenClaims, claims => (claims ? claims.username : null));

export const getPermissions = createSelector(getAccessTokenClaims, claims => (claims ? claims.permissions : []));

const toArray = <T>(a: T | T[]): T[] => (Array.isArray(a) ? a : [a]);
const containsAny =
  <T>(required: T[]) =>
  (toCheck: T[]): boolean =>
    intersection(required, toCheck).length > 0;

/**
 * Check if the user has any of the permissions, empty array/string
 * means every user passes as long as they are logged in
 */
export const matchesPermissions = memoizeWith(toString, (required: string | string[]) =>
  createSelector(isLoggedIn, getPermissions, (logged, perms): boolean => {
    if (!logged) return false;

    return isEmpty(required) || containsAny(toArray(required))(perms);
  }),
);

export const getLocalPresets = createSelector((state: ApplicationState) => state.presets, identity);

export const getUpcomingMatches = createSelector((state: ApplicationState) => state.upcoming.matches, identity);

export const getUpcomingLastUpdated = createSelector((state: ApplicationState) => state.upcoming.updated, identity);
