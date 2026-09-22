import { createSelector } from 'reselect';

import type { ApplicationState } from './ApplicationState';

export const getHostingHistoryCursor = createSelector(
  (state: ApplicationState) => state.hostHistory.matches,
  matches => {
    if (matches.length === 0) return;

    return matches[matches.length - 1].id;
  },
);

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
