import { jwtDecode } from 'jwt-decode';
import { createSelector } from 'reselect';

import dayjs from '../dayjs';

import type { ApplicationState } from './ApplicationState';

export const isDarkMode = createSelector(
  (state: ApplicationState) => state.settings.isDarkMode,
  x => x,
);

export const getTimezone = createSelector(
  (state: ApplicationState) => state.settings.timezone,
  x => x,
);

export const is12hFormat = createSelector(
  (state: ApplicationState) => state.settings.is12h,
  x => x,
);

export const getTimeFormat = createSelector(is12hFormat, is12h => (is12h ? 'h:mm A' : 'HH:mm'));

export const shouldHideRemoved = createSelector(
  (state: ApplicationState) => state.settings.hideRemoved,
  x => x,
);

export const shouldShowOwnRemoved = createSelector(
  (state: ApplicationState) => state.settings.showOwnRemoved,
  x => x,
);

export const getTagDateTimeFormat = createSelector(getTimeFormat, timeFormat => `MMM Do ${timeFormat} z`);

export const getDetailsDateTimeFormat = createSelector(getTimeFormat, timeFormat => `MMM Do YYYY - ${timeFormat} z`);

export const getAccessToken = createSelector(
  (state: ApplicationState) => state.authentication.accessToken,
  x => x,
);

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

export const getRefreshToken = createSelector(
  (state: ApplicationState) => state.authentication.refreshToken,
  x => x,
);

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

export const getLocalPresets = createSelector(
  (state: ApplicationState) => state.presets,
  x => x,
);

export const getUpcomingMatches = createSelector(
  (state: ApplicationState) => state.upcoming.matches,
  x => x,
);

export const getUpcomingLastUpdated = createSelector(
  (state: ApplicationState) => state.upcoming.updated,
  x => x,
);
