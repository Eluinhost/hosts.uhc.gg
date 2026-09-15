import { identity } from 'ramda';
import { createSelector } from 'reselect';

import { ApplicationState } from '../state/ApplicationState';
import { getPermissions, getUsername } from '../state/Selectors';

export const getHostApplicationsListState = createSelector(
  (state: ApplicationState) => state.hostingApplications.applications.list,
  identity,
);

export const getHostApplicationsDetailsState = createSelector(
  (state: ApplicationState) => state.hostingApplications.applications.details,
  identity,
);

export const getHostApplicationsReviewingState = createSelector(
  (state: ApplicationState) => state.hostingApplications.applications.reviewing,
  identity,
);

export const getHostApplicationsCreatingState = createSelector(
  (state: ApplicationState) => state.hostingApplications.applications.creating,
  identity,
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
