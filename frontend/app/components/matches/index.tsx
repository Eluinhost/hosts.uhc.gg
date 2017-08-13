import { connect } from 'react-redux';
import { ApplicationState } from '../../state/ApplicationState';
import { Dispatch } from 'redux';
import { MatchesActions } from '../../state/MatchesState';
import * as React from 'react';
import { createSelector } from 'reselect';
import { Match } from '../../Match';
import { MatchListing } from './MatchListing';
import { RouteComponentProps } from 'react-router';

type StateProps = {
  readonly matches: Match[];
  readonly error: string | null;
  readonly loading: boolean;
};

type DispatchProps = {
  readonly refetch: () => Promise<void>;
};

const MatchesPageComponent: React.SFC<StateProps & DispatchProps> = ({ matches, error, loading, refetch }) => (
  <MatchListing
    matches={matches}
    error={error}
    loading={loading}
    refetch={refetch}
  />
);

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
    }),
  )(MatchesPageComponent);
