import { RouteComponentProps } from 'react-router';
import * as React from 'react';
import { Match } from '../Match';
import { Spinner, NonIdealState, Alert, Intent, Button, Overlay } from '@blueprintjs/core';
import { MatchModerationActions, MatchModerationState } from '../state/MatchModerationState';
import { connect } from 'react-redux';
import { ApplicationState } from '../state/ApplicationState';
import { Dispatch } from 'redux';

export type MatchModerationPageDispatchProps = {
  readonly refetch: () => any;
  readonly askForReason: (id: number) => any;
  readonly updateReason: (reason: string) => any;
  readonly closeModal: () => any;
  readonly confirmDelete: () => any;
};

type MatchModerationPageProps = MatchModerationState & MatchModerationPageDispatchProps & RouteComponentProps<any>;

class MatchModerationPageComponent extends React.Component<MatchModerationPageProps> {
  componentDidMount() {
    this.props.refetch();
  }

  static Error: React.SFC<{ loading: boolean, error?: string }> = ({ loading, error }) => {
    if (loading || !error)
      return null;

    return <div className="pt-callout pt-intent-danger"><h5>{error}</h5></div>;
  }

  static Loader: React.SFC<{ loading: boolean }> = ({ loading }) => {
    if (!loading)
      return null;

    return <NonIdealState visual={<Spinner/>} title="Loading..."/>;
  }

  static Match: React.SFC<{ match: Match, onDeletePress: () => any }> = ({ match, onDeletePress }) => (
    <div className="pt-card match-moderation-match">
      <strong>ID:{match.id}</strong>
      {match.author}'s #{match.count}

      <div className="match-moderation-actions">
        <button
          className="pt-button pt-intent-danger"
          onClick={onDeletePress}
          disabled={match.removed}
        >
          {match.removed ? 'Removed' : 'Delete'}
        </button>
        {match.removed && <span className="removed-reason">{match.removedReason} - /u/{match.removedBy}</span>}
      </div>
    </div>
  )

  renderMatches = () => this.props.matches.map((match) => {
    const onDeletePress = () => this.props.askForReason(match.id);

    return <MatchModerationPageComponent.Match match={match} key={match.id} onDeletePress={onDeletePress} />;
  })

  onRemovalReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => this.props.updateReason(e.target.value);

  render() {
    const validReason = this.props.removal.validReason;

    return (
      <div>
        <Button
          disabled={this.props.fetching}
          onClick={this.props.refetch}
          iconName="refresh"
          intent={Intent.SUCCESS}
        >
          Refresh
        </Button>

        <MatchModerationPageComponent.Error loading={this.props.fetching} error={this.props.error} />
        <MatchModerationPageComponent.Loader loading={this.props.fetching} />
        {this.renderMatches()}

        <Overlay
          isOpen={this.props.removal.isModalOpen}
          autoFocus
          canEscapeKeyClose
          canOutsideClickClose
          hasBackdrop
          inline={false}
          onClose={this.props.closeModal}
        >
          <div className="pt-card pt-elevation-4 delete-match-modal">
            <h3>Are you sure you want to delete this game?</h3>

            <label>Reason: (required)</label>
            <textarea
              className={`pt-input pt-fill ${validReason ? 'pt-intent-success' : 'pt-intent-danger'}`}
              value={this.props.removal.reason}
              onChange={this.onRemovalReasonChange}
            />

            {this.props.removal.error && <span>{this.props.removal.error}</span>}

            <Button onClick={this.props.closeModal} disabled={this.props.removal.fetching}>Cancel</Button>
            <Button
              intent={Intent.DANGER}
              onClick={this.props.confirmDelete}
              disabled={!validReason || this.props.removal.fetching}
            >
              Delete
            </Button>
          </div>
        </Overlay>
      </div>
    );
  }
}

function mapStateToProps(state: ApplicationState): MatchModerationState {
  return state.matchModeration;
}

function mapDispatchToProps(dispatch: Dispatch<ApplicationState>): MatchModerationPageDispatchProps {
  return {
    refetch: () => dispatch(MatchModerationActions.refetch()),
    confirmDelete: () => dispatch(MatchModerationActions.confirmDelete()),
    updateReason: (reason: string) => dispatch(MatchModerationActions.updateReason(reason)),
    closeModal: () => dispatch(MatchModerationActions.closeModal()),
    askForReason: (id: number) => dispatch(MatchModerationActions.askForReason(id)),
  };
}

export const MatchModerationPage: React.ComponentClass<RouteComponentProps<any>> =
  connect<MatchModerationState, MatchModerationPageDispatchProps, RouteComponentProps<any>>(
    mapStateToProps,
    mapDispatchToProps,
  )(MatchModerationPageComponent);
