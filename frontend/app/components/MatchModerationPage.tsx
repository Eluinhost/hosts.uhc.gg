import { RouteComponentProps } from 'react-router';
import * as React from 'react';
import { Match } from '../Match';
import { Spinner, NonIdealState, Alert, Intent } from '@blueprintjs/core';

type MatchComponentProps = {
  readonly match: Match;
};

type MatchComponentState = {
  readonly confirmOpen: boolean;
  readonly removalReason: string;
};

class MatchComponent extends React.Component<MatchComponentProps, MatchComponentState> {
  state = {
    confirmOpen: false,
    removalReason: '',
  };

  onDeletePress = () => this.setState({ confirmOpen: true });

  onDeleteConfirm() {
    if (!this.state.removalReason)
      return;

    // TODO call api
  }

  onRemovalReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    this.setState({ removalReason: e.target.value })

  render() {
    return (
      <div className="pt-card">
        <strong>ID:{this.props.match.id}</strong>
        {this.props.match.author}'s #{this.props.match.count}
        <button className="pt-button pt-intent-danger" onClick={this.onDeletePress}>Delete</button>
        <Alert
          isOpen={this.state.confirmOpen}
          intent={Intent.DANGER}
          confirmButtonText="Delete"
          iconName="warning-sign"
          onConfirm={this.onDeleteConfirm}
        >
          <p>
            Are you sure you want to delete this game?
            <br/>
            You must provide a reason below:
          </p>
          <div>
            <textarea
              className="pt-input pt-fill"
              value={this.state.removalReason}
              onChange={this.onRemovalReasonChange}
            />
          </div>
        </Alert>
      </div>
    );
  }
}

export type MatchModerationPageState = {
  readonly matches: Match[];
  readonly loading: boolean;
  readonly error: string | null;
};

export class MatchModerationPage extends React.Component<RouteComponentProps<any>, MatchModerationPageState> {
  state = {
    matches: [],
    loading: false,
    error: '',
  };

  reload = () => {
    if (this.state.loading)
      return;

    this.setState({
      loading: true,
    });

    fetch('/api/matches')
      .then(_ => _.json())
      .then(data => this.setState({
        matches: data,
        loading: false,
        error: null,
      }))
      .catch((err) => {
        console.error(err);
        this.setState({
          loading: false,
          error: 'Unable to fetch match list',
        });
      });
  }

  componentDidMount() {
    this.reload();
  }

  renderMatch = (item: Match) => <MatchComponent match={item} key={item.id} />;

  renderBody = () => {
    if (this.state.loading) {
      return <NonIdealState visual={<Spinner/>} title="Loading..."/>;
    }

    const content =
      this.state.matches.length
        ? this.state.matches.map(this.renderMatch)
        : <NonIdealState title="No matches found" visual="geosearch" />;

    return (
      <div>
        {this.state.error && <div className="pt-callout pt-intent-danger"><h5>{this.state.error}</h5></div>}
        {content}
      </div>
    );
  }

  render() {
    return (
      <div>
        <h1>Match Moderation</h1>
        <button className="pt-button" disabled={this.state.loading} onClick={this.reload}>Refresh</button>

        {this.renderBody()}
      </div>
    );
  }
}
