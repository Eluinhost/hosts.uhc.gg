import * as React from 'react';
import { Button, Intent, NonIdealState, Spinner, Switch } from '@blueprintjs/core';
import { If } from '../If';
import { NoMatches } from './NoMatches';
import { RemovalModal } from './RemovalModal';
import { ApprovalModal } from './ApprovalModal';
import { Match } from '../../Match';
import { MatchRow } from './MatchRow';
import { map, memoize } from 'ramda';
import { connect, Dispatch } from 'react-redux';
import { createSelector } from 'reselect';
import { ApplicationState } from '../../state/ApplicationState';
import { MatchesActions } from '../../state/MatchesState';
import { getUsername, matchesPermissions } from '../../state/Selectors';

type MatchListingProps = {
  readonly matches: Match[];
  readonly loading: boolean;
  readonly error: string | null;
  readonly refetch: () => void;
};

type StateProps = {
  readonly hideRemoved: boolean;
  readonly showOwnRemoved: boolean;
  readonly username: string | null;
  readonly isApprovalModalOpen: boolean;
  readonly isRemovalModalOpen: boolean;
  readonly isModerator: boolean;
};

type DispatchProps = {
  readonly openRemovalModal: (id: number) => void;
  readonly openApprovalModal: (id: number) => void;
  readonly closeRemovalModal: () => void;
  readonly closeApprovalModal: () => void;
  readonly submitRemoval: (reason: string) => Promise<void>;
  readonly submitApproval: () => Promise<void>;
  readonly toggleHideRemoved: () => void;
  readonly toggleShowOwnRemoved: () => void;
};

class MatchListingComponent extends React.Component<MatchListingProps & StateProps & DispatchProps> {
  componentDidMount(): void {
    this.props.refetch();
  }

  memoRemovalModal: (id: number) => () => void = memoize((id: number) => () => this.props.openRemovalModal(id));
  memoApprovalModal: (id: number) => () => void = memoize((id: number) => () => this.props.openApprovalModal(id));

  renderMatches = (): React.ReactElement<any>[] => map(match => (
    <MatchRow
      match={match}
      key={match.id}
      onRemovePress={this.memoRemovalModal(match.id)}
      onApprovePress={this.memoApprovalModal(match.id)}
      canRemove={this.props.isModerator || this.props.username === match.author}
    />
  ), this.props.matches)

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

        <If condition={this.props.matches.length > 0} alternative={NoMatches}>
          <div>
            {this.renderMatches()}
          </div>
        </If>

        <RemovalModal
          isOpen={this.props.isRemovalModalOpen}
          confirm={this.props.submitRemoval}
          close={this.props.closeRemovalModal}
        />
        <ApprovalModal
          isOpen={this.props.isApprovalModalOpen}
          confirm={this.props.submitApproval}
          close={this.props.closeApprovalModal}
        />
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
  state => state.matches.hideRemoved,
  state => state.matches.showOwnRemoved,
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
  boolean, // isMod
  string | null, // username
  Match[], // visible matches
  boolean, // filters
  boolean, // filters
  boolean, // modals
  boolean, // modals
  StateProps // OUTPUT
  >(
  matchesPermissions('moderator'),
  getUsername,
  visibleMatches,
  state => state.matches.hideRemoved,
  state => state.matches.showOwnRemoved,
  state => state.matches.approval.isModalOpen,
  state => state.matches.removal.isModalOpen,
  (isModerator, username, matches, hideRemoved, showOwnRemoved, isApprovalModalOpen, isRemovalModalOpen) => ({
    isModerator,
    username,
    matches,
    hideRemoved,
    showOwnRemoved,
    isApprovalModalOpen,
    isRemovalModalOpen,
  }),
);

export const MatchListing: React.ComponentClass<MatchListingProps> =
  connect<StateProps, DispatchProps, MatchListingProps>(
    stateSelector,
    (dispatch: Dispatch<ApplicationState>): DispatchProps => ({
      closeRemovalModal: () => dispatch(MatchesActions.closeRemovalModal()),
      closeApprovalModal: () => dispatch(MatchesActions.closeApprovalModal()),
      openRemovalModal: (id: number) => dispatch(MatchesActions.askForRemovalReason(id)),
      openApprovalModal: (id: number) => dispatch(MatchesActions.askForApproval(id)),
      submitRemoval: (reason: string) => dispatch(MatchesActions.confirmRemove(reason)),
      submitApproval: () => dispatch(MatchesActions.confirmApproval()),
      toggleHideRemoved: () => dispatch(MatchesActions.toggleHideRemoved()),
      toggleShowOwnRemoved: () => dispatch(MatchesActions.toggleShowOwnRemoved()),
    }),
  )(MatchListingComponent);
