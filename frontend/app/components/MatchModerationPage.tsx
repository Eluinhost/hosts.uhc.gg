import { RouteComponentProps } from 'react-router';
import * as React from 'react';
import { Match } from '../Match';
import { Spinner, NonIdealState, Alert, Intent, Button, Overlay } from '@blueprintjs/core';
import { MatchModerationActions, MatchModerationState } from '../state/MatchModerationState';
import { connect } from 'react-redux';
import { ApplicationState } from '../state/ApplicationState';
import { Dispatch } from 'redux';
import { contains } from 'ramda';

type MatchRowProps = {
  readonly match: Match;
  readonly onDeletePress: () => any;
  readonly canDelete: boolean;
};

const MatchDeleteButton: React.SFC<MatchRowProps> = ({ onDeletePress, match }) => (
  <Button
    onClick={onDeletePress}
    disabled={match.removed}
    intent={Intent.DANGER}
    iconName="delete"
  >
    {match.removed ? 'Removed' : 'Delete'}
  </Button>
);

const MatchRemovedReason: React.SFC<MatchRowProps> = ({ match }) => (
  <span className="removed-reason">
    {match.removedReason} - /u/{match.removedBy}
  </span>
);

const MatchRow: React.SFC<MatchRowProps> = props => (
  <div className="pt-card match-moderation-match">
    <strong>ID:{props.match.id}</strong>
    {props.match.author}'s #{props.match.count}

    <div className="match-moderation-actions">
      {props.canDelete && <MatchDeleteButton {...props}/>}
      {props.match.removed && <MatchRemovedReason {...props}/>}
    </div>
  </div>
);

const Error: React.SFC<{ loading: boolean, error?: string }> = ({ loading, error }) => {
  if (loading || !error)
    return null;

  return <div className="pt-callout pt-intent-danger"><h5>{error}</h5></div>;
};

const Loader: React.SFC<{ loading: boolean }> = ({ loading }) => {
  if (!loading)
    return null;

  return <NonIdealState visual={<Spinner/>} title="Loading..."/>;
};

export type MatchModerationPageDispatchProps = {
  readonly refetch: () => any;
  readonly askForReason: (id: number) => any;
  readonly updateReason: (reason: string) => any;
  readonly closeModal: () => any;
  readonly confirmDelete: () => any;
};

export type MatchModerationPageStateProps = {
  readonly isModerator: boolean;
  readonly username: string;
} & MatchModerationState;

type MatchModerationPageProps =
  MatchModerationPageStateProps & MatchModerationPageDispatchProps & RouteComponentProps<any>;

class MatchModerationPageComponent extends React.Component<MatchModerationPageProps> {
  componentDidMount() {
    this.props.refetch();
  }

  renderMatches = () => this.props.matches.map((match) => {
    const onDeletePress = () => this.props.askForReason(match.id);

    return (
      <MatchRow
        match={match}
        key={match.id}
        onDeletePress={onDeletePress}
        canDelete={this.props.isModerator || this.props.username === match.author}
      />
    );
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

        <Error loading={this.props.fetching} error={this.props.error} />
        <Loader loading={this.props.fetching} />
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

            <Button
              onClick={this.props.closeModal}
              disabled={this.props.removal.fetching}
              iconName="arrow-left"
            >
              Cancel
            </Button>
            <Button
              intent={Intent.DANGER}
              onClick={this.props.confirmDelete}
              disabled={!validReason || this.props.removal.fetching}
              iconName="delete"
            >
              Delete
            </Button>
          </div>
        </Overlay>
      </div>
    );
  }
}

function mapStateToProps(state: ApplicationState): MatchModerationPageStateProps {
  return {
    ...state.matchModeration,
    isModerator: contains('moderator', state.authentication.data!.accessTokenClaims.permissions),
    username: state.authentication.data!.accessTokenClaims.username,
  };
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
  connect<MatchModerationPageStateProps, MatchModerationPageDispatchProps, RouteComponentProps<any>>(
    mapStateToProps,
    mapDispatchToProps,
  )(MatchModerationPageComponent);
