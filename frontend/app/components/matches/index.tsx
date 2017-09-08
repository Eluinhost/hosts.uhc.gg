import { connect } from 'react-redux';
import { ApplicationState } from '../../state/ApplicationState';
import { Dispatch } from 'redux';
import { MatchesActions } from '../../state/MatchesState';
import * as React from 'react';
import { createSelector } from 'reselect';
import { Match } from '../../Match';
import { MatchListing } from './MatchListing';
import { RouteComponentProps } from 'react-router';
import { Title } from '../Title';

type StateProps = {
  readonly matches: Match[];
  readonly error: string | null;
  readonly loading: boolean;
};

type DispatchProps = {
  readonly refetch: () => Promise<void>;
  readonly confirmRemove: (id: number, reason: string) => Promise<void>;
  readonly confirmApprove: (id: number) => Promise<void>;
};

const dontLoadMore = () => Promise.reject('Should not be called');

class MatchesPageComponent extends React.PureComponent<StateProps & DispatchProps & RouteComponentProps<any>> {
  render() {
    const { matches, error, loading, refetch, confirmRemove, confirmApprove } = this.props;

    return (
      <div>
        <Title>Upcoming Matches</Title>
        <h1>Upcoming Matches</h1>
        <MatchListing
          matches={matches}
          error={error}
          loading={loading}
          refetch={refetch}
          onRemove={confirmRemove}
          onApprove={confirmApprove}
          hasMore={false}
          loadMore={dontLoadMore}
        />
      </div>
    );
  }
}

const stateSelector = createSelector<ApplicationState, Match[], string | null, boolean, StateProps>(
  state => state.matches.matches,
  state => state.matches.error,
  state => state.matches.fetching,
  (matches, error, loading) => ({
    matches,
    error,
    loading,
  }),
);

export const MatchesPage: React.ComponentClass<RouteComponentProps<any>> =
  connect<StateProps, DispatchProps, RouteComponentProps<any>>(
    stateSelector,
    (dispatch: Dispatch<ApplicationState>): DispatchProps => ({
      refetch: () => dispatch(MatchesActions.refetch()),
      confirmRemove: (id: number, reason: string) => dispatch(MatchesActions.confirmRemove(id, reason)),
      confirmApprove: (id: number) => dispatch(MatchesActions.confirmApproval(id)),
    }),
  )(MatchesPageComponent);
