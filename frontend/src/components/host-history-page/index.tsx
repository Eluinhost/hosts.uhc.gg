import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { MatchListing } from '../match-listing';
import { identity } from 'ramda';
import { Title } from '../Title';
import { HostHistoryState } from '../../state/HostHistoryState';
import { connect, Dispatch } from 'react-redux';
import { createSelector } from 'reselect';
import { ApplicationState } from '../../state/ApplicationState';
import { LoadHostHistory } from '../../actions';
import { H1 } from "@blueprintjs/core";

type RouteParams = {
  readonly host: string;
};

type StateProps = HostHistoryState;

type DispatchProps = {
  readonly reload: () => void;
  readonly next: () => void;
  readonly clear: () => void;
};

class HistoryPageComponent extends React.PureComponent<RouteComponentProps<RouteParams> & StateProps & DispatchProps> {
  public componentWillUnmount() {
    this.props.clear();
  }

  public render() {
    return (
      <div>
        <Title>Hosting History - {this.props.match.params.host}</Title>
        <H1>Hosting history for /u/{this.props.match.params.host}</H1>

        <p>
          Matches are in reverse order by date they were <em>created.</em>
        </p>

        <MatchListing
          matches={this.props.matches}
          error={this.props.error}
          loading={this.props.fetching}
          hasMore={this.props.hasMorePages}
          loadMore={this.props.next}
          refetch={this.props.reload}
          lastUpdated={this.props.updated}
        />
      </div>
    );
  }
}

const stateSelector = createSelector<ApplicationState, HostHistoryState, StateProps>(
  state => state.hostHistory,
  identity,
);

// TODO get rid of ownprops in dispatch mapping
const mapDispatchToProps = (dispatch: Dispatch<ApplicationState>, ownProps?: RouteComponentProps<RouteParams>): DispatchProps => ({
  reload: () => dispatch(LoadHostHistory.start({ host: ownProps!.match.params.host, refresh: true })),
  next: () => dispatch(LoadHostHistory.start({ host: ownProps!.match.params.host, refresh: false })),
  clear: () => dispatch(LoadHostHistory.clear()),
});

export const HistoryPage: React.ComponentClass<RouteComponentProps<RouteParams>> = connect<
  StateProps,
  DispatchProps,
  RouteComponentProps<RouteParams>
>(stateSelector, mapDispatchToProps)(HistoryPageComponent);
