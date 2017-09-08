import { Match } from '../../Match';
import * as React from 'react';
import { Spinner, NonIdealState } from '@blueprintjs/core';
import { MatchDetailsRenderer } from './MatchDetailsRenderer';
import { find, always, propEq } from 'ramda';
import { getMatch } from '../../api/index';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { ApplicationState } from '../../state/ApplicationState';

type MatchDetailsDataFetcherProps = {
  readonly matchId: number;
};

type StateProps = {
  readonly upcoming: Match[];
};

type State = {
  readonly fetching: boolean;
  readonly match: Match | null;
  readonly error: string | null;
};

class MatchDetailsComponent extends React.Component<MatchDetailsDataFetcherProps & StateProps, State> {
  state = {
    fetching: true,
    match: null,
    error: null,
  };

  componentDidMount() {
    const inUpcoming = find<Match>(propEq('id', this.props.matchId), this.props.upcoming);

    if (inUpcoming) {
      this.setState({
        fetching: false,
        match: inUpcoming,
        error: null,
      });
    } else {
      getMatch(this.props.matchId)
        .then(match => this.setState({
          match,
          fetching: false,
          error: null,
        }))
        .catch(err => this.setState({
          fetching: false,
          error: 'Unable to fetch data',
          match: null,
        }));
    }
  }

  render() {
    if (this.state.fetching)
      return <Spinner />;

    if (this.state.error)
      return <NonIdealState visual="warning-sign" title="Error loading data" />;

    if (this.state.match == null)
      return <NonIdealState visual="geosearch" title="Not found" />;

    return <MatchDetailsRenderer match={this.state.match!} />;
  }
}

const stateSelector = createSelector<ApplicationState, Match[], StateProps>(
  state => state.matches.matches,
  upcoming => ({
    upcoming,
  }),
);

export const MatchDetails: React.ComponentClass<MatchDetailsDataFetcherProps> =
  connect<StateProps, {}, MatchDetailsDataFetcherProps>(
    stateSelector,
    always({}),
  )(MatchDetailsComponent);
