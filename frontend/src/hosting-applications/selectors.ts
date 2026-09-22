import { createSelector } from 'reselect';

import type { ApplicationState } from '../state/ApplicationState';

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
