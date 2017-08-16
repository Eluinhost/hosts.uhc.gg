import * as React from 'react';
import { Match } from '../../Match';
import { RouteComponentProps } from 'react-router';
import { MatchListing } from '../matches/MatchListing';
import { getHostingHistory } from '../../api';
import { concat, last } from 'ramda';

type State = {
  readonly matches: Match[];
  readonly error: string | null;
  readonly loading: boolean;
  readonly hasMore: boolean;
};

type Params = {
  readonly host: string;
};

export class HistoryPage extends React.Component<RouteComponentProps<Params>, State> {
  state = {
    matches: [],
    error: null,
    loading: true,
    hasMore: false,
  };

  beforeId = () => this.state.matches.length > 0
    ? last<Match, Match[]>(this.state.matches)!.id
    : undefined

  loadNextPage = async ()  => {
    this.setState({
      loading: true,
      error: null,
    });

    try {
      const matches = await getHostingHistory(this.props.match.params.host, this.beforeId());

      this.setState({
        matches: concat(this.state.matches, matches),
        error: null,
        loading: false,
        hasMore: matches.length > 0,
      });
    } catch (err) {
      this.setState({
        error: 'Unable to fetch list from server',
        loading: false,
      });
    }
  }

  refetch = () => {
    // clear list first then just fetch the next page
    this.setState({
      matches: [],
      hasMore: true,
    });

    setTimeout(() => this.loadNextPage());
  }

  render() {
    return (
      <div>
        <h1>Hosting history for /u/{this.props.match.params.host}</h1>

        <p>
          Matches are in reverse order by date they were <em>created.</em>
        </p>

        <MatchListing
          matches={this.state.matches}
          error={this.state.error}
          loading={this.state.loading}
          refetch={this.refetch}
          hasMore={this.state.hasMore}
          loadMore={this.loadNextPage}
        />
      </div>
    );
  }
}
