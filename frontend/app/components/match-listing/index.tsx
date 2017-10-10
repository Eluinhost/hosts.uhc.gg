import * as React from 'react';
import { Button, Intent, NonIdealState, Spinner, Switch } from '@blueprintjs/core';
import { If } from '../If';
import { RemovalModal } from '../removal-modal';
import { ApprovalModal } from '../approval-modal';
import { Match } from '../../models/Match';
import { MatchRow } from '../match-row';
import { connect, Dispatch } from 'react-redux';
import { createSelector } from 'reselect';
import { ApplicationState } from '../../state/ApplicationState';
import { getUsername } from '../../state/Selectors';
import { Settings } from '../../actions';

type MatchListingProps = {
  readonly matches: Match[];
  readonly loading: boolean;
  readonly error: string | null;
  readonly refetch: () => void;
  readonly loadMore: () => void;
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
  private renderMatch = (match: Match, index: number): React.ReactElement<any> => (
    <MatchRow
      key={match.id}
      match={match}
      disableApproval={this.props.disableApprove}
      disableRemoval={this.props.disableRemove}
    />
  )

  private noMatches: React.ReactElement<any> = (
    <NonIdealState
      title="Nothing to see!"
      visual="geosearch"
      description="There are currently no matches"
    />
  );

  render() {
    return (
      <div>
        <div>
          <Switch
            checked={this.props.hideRemoved}
            label="Hide Removed"
            onChange={this.props.toggleHideRemoved}
          />
          <If condition={!!this.props.username && this.props.hideRemoved}>
            <Switch
              checked={this.props.showOwnRemoved}
              label="Show Own Removed"
              onChange={this.props.toggleShowOwnRemoved}
            />
          </If>
          <Button
            disabled={this.props.loading}
            onClick={this.props.refetch}
            iconName="refresh"
            intent={Intent.SUCCESS}
          >
            Refresh
          </Button>
        </div>


        <If condition={!this.props.loading && !!this.props.error}>
          <div className="pt-callout pt-intent-danger"><h5>{this.props.error}</h5></div>
        </If>

        <If condition={this.props.loading}>
          <NonIdealState visual={<Spinner/>} title="Loading..."/>
        </If>

        <If condition={this.props.filteredMatches.length > 0} alternative={this.noMatches}>
          <div>
            {this.props.filteredMatches.map(this.renderMatch)}
          </div>
        </If>

        <If condition={this.props.hasMore}>
          <Button
            loading={this.props.loading}
            disabled={this.props.loading}
            onClick={this.props.loadMore}
            iconName="refresh"
            intent={Intent.SUCCESS}
            text="Load more"
          />
        </If>

        <RemovalModal />
        <ApprovalModal />
      </div>
    );
  }
}

const visibleMatches = createSelector<
  ApplicationState, // STATE
  MatchListingProps,  // PROPS
  Match[], // prop matches
  string | null, // getUsername
  boolean, // filters
  boolean, // filters
  Match[] // OUTPUT
  >(
  (state, props) => props.matches, // get matches from the props
  getUsername, // get current username if exists
  state => state.settings.hideRemoved,
  state => state.settings.showOwnRemoved,
  (matches, username, hideRemoved, showOwnRemoved) => {
    if (!hideRemoved)
      return matches;

    if (!showOwnRemoved)
      return matches.filter(m => !m.removed);

    return matches.filter(m => !m.removed || m.author === username);
  },
);

const stateSelector = createSelector<
  ApplicationState, // STATE
  MatchListingProps, // PROPS
  string | null, // username
  Match[], // visible matches
  boolean, // filters
  boolean, // filters
  StateProps // OUTPUT
  >(
  getUsername,
  visibleMatches,
  state => state.settings.hideRemoved,
  state => state.settings.showOwnRemoved,
  (username, matches, hideRemoved, showOwnRemoved): StateProps =>
    ({
      username,
      hideRemoved,
      showOwnRemoved,
      filteredMatches: matches,
    }),
);

export const MatchListing: React.ComponentClass<MatchListingProps> =
  connect<StateProps, DispatchProps, MatchListingProps>(
    stateSelector,
    (dispatch: Dispatch<ApplicationState>): DispatchProps => ({
      toggleHideRemoved: () => dispatch(Settings.toggleHideRemoved()),
      toggleShowOwnRemoved: () => dispatch(Settings.toggleShowOwnRemoved()),
    }),
  )(MatchListingComponent);
