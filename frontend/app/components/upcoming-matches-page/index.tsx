import { connect } from 'react-redux';
import { ApplicationState } from '../../state/ApplicationState';
import { Dispatch } from 'redux';
import * as React from 'react';
import { createSelector } from 'reselect';
import { Match } from '../../Match';
import { MatchListing } from '../match-listing';
import { RouteComponentProps } from 'react-router';
import { Title } from '../Title';
import { UpdateUpcoming } from '../../actions';

type StateProps = {
  readonly matches: Match[];
  readonly error: string | null;
  readonly loading: boolean;
};

type DispatchProps = {
  readonly refetch: () => void;
};

const dontLoadMore = () => {
  throw 'Should not be called';
};

class UpcomingMatchesPageComponent extends React.PureComponent<StateProps & DispatchProps & RouteComponentProps<any>> {
  public componentDidMount() {
    this.props.refetch();
  }

  public render() {
    const { matches, error, loading, refetch } = this.props;

    return (
      <div>
        <Title>Upcoming Matches</Title>
        <h1>Upcoming Matches</h1>
        <MatchListing
          matches={matches}
          error={error}
          loading={loading}
          refetch={refetch}
          hasMore={false}
          loadMore={dontLoadMore}
        />
      </div>
    );
  }
}

const stateSelector = createSelector<ApplicationState, Match[], string | null, boolean, StateProps>(
  state => state.upcoming.matches,
  state => state.upcoming.error,
  state => state.upcoming.fetching,
  (matches, error, loading) => ({
    matches,
    error,
    loading,
  }),
);

export const UpcomingMatchesPage: React.ComponentClass<RouteComponentProps<any>> =
  connect<StateProps, DispatchProps, RouteComponentProps<any>>(
    stateSelector,
    (dispatch: Dispatch<ApplicationState>): DispatchProps => ({
      refetch: () => dispatch(UpdateUpcoming.start()),
    }),
  )(UpcomingMatchesPageComponent);
