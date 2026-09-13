import { createSelector, Selector } from 'reselect';
import { ApplicationState } from '../state/ApplicationState';
import { identity } from 'ramda';
import { HostApplicationsState } from './reducer';
import { getPermissions, getUsername } from '../state/Selectors';

export const getHostApplicationsListState: Selector<ApplicationState, HostApplicationsState['list']> = createSelector(
  state => state.hostingApplications.applications.list,
  identity,
);

export const getHostApplicationsDetailsState: Selector<
  ApplicationState,
  HostApplicationsState['details']
> = createSelector(state => state.hostingApplications.applications.details, identity);

export const getHostApplicationsReviewingState: Selector<
  ApplicationState,
  HostApplicationsState['reviewing']
> = createSelector(state => state.hostingApplications.applications.reviewing, identity);

export const getHostApplicationsCreatingState: Selector<
  ApplicationState,
  HostApplicationsState['creating']
> = createSelector(state => state.hostingApplications.applications.creating, identity);

export const getHasSubmittedHostApplicationSuccessfully: Selector<ApplicationState, boolean> = createSelector(
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
