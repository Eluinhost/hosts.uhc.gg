import { createSelector } from 'reselect';

import type { ApplicationState } from '../state/ApplicationState';
import { getPermissions, getUsername } from '../state/Selectors';

export const getHostApplicationsListState = createSelector(
  (state: ApplicationState) => state.hostingApplications.applications.list,
  x => x,
);

export const getHostApplicationsDetailsState = createSelector(
  (state: ApplicationState) => state.hostingApplications.applications.details,
  x => x,
);

export const getHostApplicationsReviewingState = createSelector(
  (state: ApplicationState) => state.hostingApplications.applications.reviewing,
  x => x,
);

export const getHostApplicationsCreatingState = createSelector(
  (state: ApplicationState) => state.hostingApplications.applications.creating,
  x => x,
);

export const getHasSubmittedHostApplicationSuccessfully = createSelector(
  getHostApplicationsCreatingState,
  state => state.data,
);

export const getHostApplicationPermissions = createSelector(getUsername, getPermissions, (username, permissions) => ({
  canApply:
    !!username &&
    !permissions.includes('host') &&
    !permissions.includes('trial host') &&
    !permissions.includes('hosting banned'),
  isBanned: permissions.includes('hosting banned'),
  canReview: permissions.includes('hosting advisor'),
  username,
}));
