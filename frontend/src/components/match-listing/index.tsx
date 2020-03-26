import * as React from 'react';
import { Button, Callout, H5, Intent, NonIdealState, Spinner, Switch } from "@blueprintjs/core";
import { RemovalModal } from '../removal-modal';
import { ApprovalModal } from '../approval-modal';
import { Match } from '../../models/Match';
import { MatchRow } from '../match-row';
import { connect, Dispatch } from 'react-redux';
import { createSelector, ParametricSelector } from "reselect";
import { ApplicationState } from '../../state/ApplicationState';
import { getUsername } from '../../state/Selectors';
import { Settings } from '../../actions';
import * as moment from 'moment';
import { RefreshButton } from './RefreshButton';
import { isUndefined } from 'util';
import { VisibilityDetector } from '../../services/VisibilityDetector';

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
  readonly filteredMatches: Match[];
  readonly hideRemoved: boolean;
  readonly showOwnRemoved: boolean;
  readonly username: string | null;
};

type DispatchProps = {
  readonly toggleHideRemoved: () => void;
  readonly toggleShowOwnRemoved: () => void;
};

class MatchListingComponent extends React.PureComponent<MatchListingProps & StateProps & DispatchProps> {
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

  private noMatches: React.ReactElement = (
    <NonIdealState title="Nothing to see!" icon="geosearch" description="There are currently no matches" />
  );

  render() {
    const matches =
      this.props.filteredMatches.length > 0 ? (
        <div>{this.props.filteredMatches.map(this.renderMatch)}</div>
      ) : (
        this.noMatches
      );

    return (
      <div>
        <div>
          <Switch checked={this.props.hideRemoved} label="Hide Removed" onChange={this.props.toggleHideRemoved} />
          {!!this.props.username && this.props.hideRemoved && (
            <Switch
              checked={this.props.showOwnRemoved}
              label="Show Own Removed"
              onChange={this.props.toggleShowOwnRemoved}
            />
          )}
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

        {this.props.loading && <NonIdealState icon={<Spinner />} title="Loading..." />}

        {matches}

        {this.props.hasMore && (
          <Button
            loading={this.props.loading}
            disabled={this.props.loading}
            onClick={this.props.loadMore}
            icon="refresh"
            intent={Intent.SUCCESS}
            text="Load more"
          />
        )}

        <RemovalModal />
        <ApprovalModal />
      </div>
    );
  }
}

const visibleMatches: ParametricSelector<ApplicationState, MatchListingProps | undefined, Match[]> = createSelector(
  (state: ApplicationState, props: MatchListingProps | undefined) => props ? props.matches : [], // get matches from the props
  getUsername, // get current username if exists
  state => state.settings.hideRemoved,
  state => state.settings.showOwnRemoved,
  (matches, username, hideRemoved, showOwnRemoved) => {
    if (!hideRemoved) return matches;

    if (!showOwnRemoved) return matches.filter(m => !m.removed);

    return matches.filter(m => !m.removed || m.author === username);
  },
);

// TODO remove props
const stateSelector: ParametricSelector<ApplicationState, MatchListingProps | undefined, StateProps> = createSelector(
  getUsername,
  visibleMatches,
  state => state.settings.hideRemoved,
  state => state.settings.showOwnRemoved,
  (username, matches, hideRemoved, showOwnRemoved): StateProps => ({
    username,
    hideRemoved,
    showOwnRemoved,
    filteredMatches: matches,
  }),
);

export const MatchListing: React.ComponentClass<MatchListingProps> = connect<
  StateProps,
  DispatchProps,
  MatchListingProps
>(
  stateSelector,
  (dispatch: Dispatch<ApplicationState>): DispatchProps => ({
    toggleHideRemoved: () => dispatch(Settings.toggleHideRemoved()),
    toggleShowOwnRemoved: () => dispatch(Settings.toggleShowOwnRemoved()),
  }),
)(MatchListingComponent);
