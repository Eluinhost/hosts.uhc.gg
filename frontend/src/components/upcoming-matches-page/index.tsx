import { connect } from 'react-redux';
import { ApplicationState } from '../../state/ApplicationState';
import { Dispatch } from 'redux';
import * as React from 'react';
import { createSelector } from 'reselect';
import { MatchListing } from '../match-listing';
import { RouteComponentProps } from 'react-router';
import { Title } from '../Title';
import { UpdateUpcoming } from '../../actions';
import { UpcomingState } from '../../state/UpcomingState';
import { H1 } from '@blueprintjs/core';

type StateProps = UpcomingState;

type DispatchProps = {
  readonly refetch: () => void;
};

const dontLoadMore = () => {
  throw new Error('Should not be called');
};

class UpcomingMatchesPageComponent extends React.PureComponent<StateProps & DispatchProps & RouteComponentProps<any>> {
  public render() {
    const { matches, error, fetching, updated, refetch } = this.props;

    return (
      <div>
        <Title>Upcoming Matches</Title>
        <H1>Upcoming Matches</H1>
        <MatchListing
          matches={matches}
          error={error}
          loading={fetching}
          refetch={refetch}
          autoRefreshSeconds={60}
          hasMore={false}
          loadMore={dontLoadMore}
          lastUpdated={updated}
        />
      </div>
    );
  }
}

const stateSelector = createSelector<ApplicationState, UpcomingState, StateProps>(
  state => state.upcoming,
  state => state,
);

export const UpcomingMatchesPage: React.ComponentType<RouteComponentProps<any>> = connect<
  StateProps,
  DispatchProps,
  RouteComponentProps<any>
>(
  stateSelector,
  (dispatch: Dispatch): DispatchProps => ({
    refetch: () => dispatch(UpdateUpcoming.start()),
  }),
)(UpcomingMatchesPageComponent);
