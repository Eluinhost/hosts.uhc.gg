import * as React from 'react';
import { Match } from '../../Match';
import { RouteComponentProps } from 'react-router';
import { MatchListing } from '../matches/MatchListing';
import { getHostingHistory } from '../../api';

type State = {
  readonly matches: Match[];
  readonly error: string | null;
  readonly loading: boolean;
};

export class HistoryPage extends React.Component<RouteComponentProps<{ host: string }>, State> {
  state = {
    matches: [],
    error: null,
    loading: true,
  };
  
  refetch = async () => {
    this.setState({
      error: null,
      loading: true,
    });

    try {
      const matches = await getHostingHistory(this.props.match.params.host);

      this.setState({
        matches,
        error: null,
        loading: false,
      });
    } catch (err) {
      this.setState({
        error: 'Unable to fetch list from server',
        loading: false,
      });
    }
  }
  
  render() {
    return (
      <MatchListing
        matches={this.state.matches}
        error={this.state.error}
        loading={this.state.loading}
        refetch={this.refetch}
      />
    );
  }
}
