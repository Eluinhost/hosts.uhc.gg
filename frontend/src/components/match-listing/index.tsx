import * as React from 'react';
import { Button, Callout, H5, InputGroup, Intent, NonIdealState, Spinner, Switch } from '@blueprintjs/core';
import { RemovalModal } from '../removal-modal';
import { ApprovalModal } from '../approval-modal';
import { Match } from '../../models/Match';
import { MatchRow } from '../match-row';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { createSelector, Selector } from 'reselect';
import { ApplicationState } from '../../state/ApplicationState';
import { getUsername } from '../../state/Selectors';
import { Settings } from '../../actions';
import moment from 'moment-timezone';
import { RefreshButton } from './RefreshButton';
import { isUndefined } from 'util';
import { VisibilityDetector } from '../../services/VisibilityDetector';

import './match-listing.sass';

type MatchListingProps = {
  readonly matches: Match[];
  readonly loading: boolean;
  readonly error: string | null;
  readonly refetch: () => void;
  readonly loadMore: () => void;
  readonly lastUpdated: moment.Moment | null;
  readonly autoRefreshSeconds?: number;
  readonly hasMore: boolean;
  readonly disableRemove?: boolean;
  readonly disableApprove?: boolean;
};

type StateProps = {
  readonly hideRemoved: boolean;
  readonly showOwnRemoved: boolean;
  readonly username: string | null;
};

type DispatchProps = {
  readonly toggleHideRemoved: () => void;
  readonly toggleShowOwnRemoved: () => void;
};

type OwnState = {
  search: string;
};

class MatchListingComponent extends React.PureComponent<MatchListingProps & StateProps & DispatchProps, OwnState> {
  state = {
    search: '',
  };

  private timerId: number | null = null;

  private visibilityDetector = new VisibilityDetector();

  private onVisibilityChange = () => {
    // always clear any existing timer first
    this.stopTimer();

    // if it's visible (or not supported) start the timer if required
    if (!this.visibilityDetector.isHidden()) {
      const { autoRefreshSeconds, lastUpdated } = this.props;

      if (!isUndefined(autoRefreshSeconds) && autoRefreshSeconds < 1) throw new Error("autorefresh shouldn't be < 1");

      // if we are to auto refresh start a timer
      if (autoRefreshSeconds) {
        this.timerId = window.setInterval(this.props.refetch, autoRefreshSeconds! * 1000);
      }

      // data is stale if it has never been updated or the last update was before the refresh timer allows
      const isDataStale: boolean =
        lastUpdated === null ||
        (!isUndefined(autoRefreshSeconds) && moment.utc().diff(lastUpdated, 'seconds') > autoRefreshSeconds);

      if (isDataStale) {
        this.props.refetch();
      }
    }
  };

  private stopTimer = () => {
    if (this.timerId) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
  };

  public componentDidMount(): void {
    this.visibilityDetector.addEventListener(this.onVisibilityChange);
    this.onVisibilityChange();
  }

  public componentWillUnmount(): void {
    this.stopTimer();
    this.visibilityDetector.removeEventListener(this.onVisibilityChange);
  }

  private renderMatch = (match: Match): React.ReactElement => (
    <MatchRow
      key={match.id}
      match={match}
      disableApproval={this.props.disableApprove}
      disableRemoval={this.props.disableRemove}
    />
  );

  private noMatches: React.ReactElement | false = !this.props.loading && (
    <NonIdealState title="Nothing to see!" icon="geosearch" description="There are currently no matches" />
  );

  removedMatchesFilter = (m: Match): boolean => {
    if (!m.removed || !this.props.hideRemoved) {
      return true;
    }

    return this.props.showOwnRemoved && m.author === this.props.username;
  };

  // pretty hacky but works
  searchQueryFilter = (query: string) => (m: Match): boolean =>
    !query ||
    JSON.stringify(m)
      .toLowerCase()
      .indexOf(query.toLowerCase()) > 0;

  handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => this.setState({ search: event.target.value });
  clearSearch = () => this.setState({ search: '' });

  renderSearchTotals = (showing: number, outOf: number) => {
    if (!this.state.search) {
      return undefined;
    }

    return <>
      Showing {showing} of {outOf}.
      <Button minimal icon="cross" onClick={this.clearSearch} />
    </>
  };

  render() {
    const afterRemovedFilter = this.props.matches.filter(this.removedMatchesFilter);

    const afterSearchQuery = afterRemovedFilter.filter(this.searchQueryFilter(this.state.search));

    const matches = afterSearchQuery.length > 0 ? afterSearchQuery.map(this.renderMatch) : this.noMatches;

    return (
      <div className="match-listing">
        <div className="match-listing__filters">
          <Switch checked={this.props.hideRemoved} label="Hide Removed" onChange={this.props.toggleHideRemoved} />
          {!!this.props.username && this.props.hideRemoved && (
            <Switch
              checked={this.props.showOwnRemoved}
              label="Show Own Removed"
              onChange={this.props.toggleShowOwnRemoved}
            />
          )}
        </div>

        <div className="match-listing__search">
          <InputGroup
            leftIcon="search"
            fill
            value={this.state.search}
            onChange={this.handleSearchChange}
            placeholder="Search"
            rightElement={this.renderSearchTotals(afterSearchQuery.length, afterRemovedFilter.length)}
          />
          <RefreshButton
            lastUpdated={this.props.lastUpdated}
            onClick={this.props.refetch}
            loading={this.props.loading}
          />
        </div>

        {!this.props.loading && !!this.props.error && (
          <Callout intent={Intent.DANGER}>
            <H5>{this.props.error}</H5>
          </Callout>
        )}

        {this.props.loading && this.props.matches.length === 0 && (
          <NonIdealState icon={<Spinner />} title="Loading..." />
        )}

        <div className="match-listing__matches">{matches}</div>

        {this.props.hasMore && (
          <div className="match-listing__footer-actions">
            <Button
              loading={this.props.loading}
              disabled={this.props.loading}
              onClick={this.props.loadMore}
              icon="refresh"
              intent={Intent.SUCCESS}
              text="Load more"
            />
          </div>
        )}

        <RemovalModal />
        <ApprovalModal />
      </div>
    );
  }
}

const stateSelector: Selector<ApplicationState, StateProps> = createSelector(
  getUsername,
  state => state.settings.hideRemoved,
  state => state.settings.showOwnRemoved,
  (username, hideRemoved, showOwnRemoved): StateProps => ({
    username,
    hideRemoved,
    showOwnRemoved,
  }),
);

export const MatchListing: React.ComponentType<MatchListingProps> = connect<
  StateProps,
  DispatchProps,
  MatchListingProps
>(
  stateSelector,
  (dispatch: Dispatch): DispatchProps => ({
    toggleHideRemoved: () => dispatch(Settings.toggleHideRemoved()),
    toggleShowOwnRemoved: () => dispatch(Settings.toggleShowOwnRemoved()),
  }),
)(MatchListingComponent);
