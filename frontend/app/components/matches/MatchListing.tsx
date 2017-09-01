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
  readonly loadMore: () => Promise<void>;
  readonly hasMore: boolean;
  readonly onApprove?: (id: number) => Promise<void>;
  readonly onRemove?: (id: number, reason: string) => Promise<void>;
};

type StateProps = {
  readonly filteredMatches: Match[];
  readonly hideRemoved: boolean;
  readonly showOwnRemoved: boolean;
  readonly username: string | null;
  readonly isHostingAdvisor: boolean;
};

type DispatchProps = {
  readonly toggleHideRemoved: () => void;
  readonly toggleShowOwnRemoved: () => void;
};

type State = {
  readonly removal: number | null;
  readonly approval: number | null;
};

type ModalType = 'approval' | 'removal';

class MatchListingComponent extends React.Component<MatchListingProps & StateProps & DispatchProps, State> {
  state = {
    approval: null,
    removal: null,
  };

  componentDidMount(): void {
    this.props.refetch();
  }

  openModal: (id: number, type: ModalType) => () => void =
    memoize((id: number, type: ModalType) => () => this.setState({
      [type]: id,
    } as Pick<State, ModalType>));

  closeModal: (type: ModalType) => () => void =
    memoize((type: ModalType) => () => this.setState({
      [type]: null,
    } as Pick<State, ModalType>));

  confirmRemoval = (reason: string) => this.props.onRemove
    ? this.props.onRemove(this.state.removal!, reason)
    : Promise.reject('No callback defined')

  confirmApproval = () => this.props.onApprove
    ? this.props.onApprove(this.state.approval!)
    : Promise.reject('No callback defined')

  renderMatches = (): React.ReactElement<any>[] => map(match => (
    <MatchRow
      match={match}
      key={match.id}
      onRemovePress={this.openModal(match.id, 'removal')}
      onApprovePress={this.openModal(match.id, 'approval')}
      canRemove={!!this.props.onRemove && (this.props.isHostingAdvisor || this.props.username === match.author)}
      canApprove={!!this.props.onApprove && this.props.isHostingAdvisor}
    />
  ), this.props.filteredMatches)

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

        <RemovalModal
          isOpen={this.state.removal !== null}
          confirm={this.confirmRemoval}
          close={this.closeModal('removal')}
        />
        <ApprovalModal
          isOpen={this.state.approval !== null}
          confirm={this.confirmApproval}
          close={this.closeModal('approval')}
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
  StateProps // OUTPUT
  >(
  matchesPermissions('hosting advisor'),
  getUsername,
  visibleMatches,
  state => state.matches.hideRemoved,
  state => state.matches.showOwnRemoved,
  (isHostingAdvisor, username, matches, hideRemoved, showOwnRemoved): StateProps => ({
    isHostingAdvisor,
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
      toggleHideRemoved: () => dispatch(MatchesActions.toggleHideRemoved()),
      toggleShowOwnRemoved: () => dispatch(MatchesActions.toggleShowOwnRemoved()),
    }),
  )(MatchListingComponent);
