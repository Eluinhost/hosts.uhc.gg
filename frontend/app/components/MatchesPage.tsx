import { RouteComponentProps } from 'react-router';
import * as React from 'react';
import { Match } from '../Match';
import { Spinner, NonIdealState, Intent, Button, Overlay } from '@blueprintjs/core';
import { MatchesActions, MatchesState } from '../state/MatchesState';
import { connect } from 'react-redux';
import { ApplicationState } from '../state/ApplicationState';
import { Dispatch } from 'redux';
import { contains } from 'ramda';
import { TeamStyles } from '../TeamStyles';

type MatchRowProps = {
  readonly match: Match;
  readonly onRemovePress: () => any;
  readonly canRemove: boolean;
};

const RemoveMatchButton: React.SFC<MatchRowProps> = ({ onRemovePress }) => (
  <Button
    onClick={onRemovePress}
    intent={Intent.DANGER}
    iconName="delete"
    className="match-remove-button"
  >
    Remove
  </Button>
);

const MatchRemovedReason: React.SFC<MatchRowProps> = ({ match }) => (
  <div className="removed-reason">
    <div className="removed-reason-reason">Removed: {match.removedReason}</div>
    <div className="removed-reason-remover">/u/{match.removedBy}</div>
  </div>
);

const Tag: React.SFC<{ tag: string }> = ({ tag }) => (
  <span className="pt-tag pt-intent-warning pt-large" title="Tag">{tag}</span>
);
const renderTags = (tags: string[]) => tags.map((tag, index) => <Tag key={index} tag={tag}/>);

const Scenario: React.SFC<{ scenario: string }> = ({ scenario }) => (
  <span className="pt-tag pt-intent-danger pt-large" title="Scenario">{scenario}</span>
);
const renderScenarios = (scenarios: string[]) => scenarios.map((scenario, index) =>
  <Scenario key={index} scenario={scenario}/>,
);

const TeamStyle: React.SFC<{ style: string, size: number | null, custom: string | null }> =
  ({ style, size, custom }) => {
    const lookup = TeamStyles.find(it => it.value === style);
    let render: string;

    if (!lookup) {
      render = `UNKNOWN STYLE: ${style}`;
    } else if (lookup.value === 'custom') {
      render = custom || 'Custom style not provided';
    } else {
      render = lookup.display;

      if (lookup.requiresTeamSize) {
        render = `${render} To${size}`;
      }
    }

    return <span>{render}</span>;
  };

const MatchRow: React.SFC<MatchRowProps> = props => (
  <div className={`pt-card match-row ${props.match.removed ? 'pt-intent-danger' : ''}`}>
    <span className="match-id pt-tag pt-large pt-intent-success">
      <span title="Unique ID" className="pt-text-muted">{props.match.id}</span>
      <span className="match-opens">{props.match.opens.format('MMM DD HH:mm')}</span>
      <span className="match-region">- {props.match.region}</span>
    </span>
    <div className="match-content">
      <h4 className="match-title">
        <span>{props.match.author}</span>
        <span>#{props.match.count}</span>
        <span>-</span>
        <TeamStyle size={props.match.size} style={props.match.teams} custom={props.match.customStyle} />
      </h4>
      <div className="match-tags">
        {renderTags(props.match.tags)}
        {renderScenarios(props.match.scenarios)}
      </div>
      <div className="match-addresses">
        <span className="pt-tag pt-minimal pt-intent-primary pt-large" title="Server Address">
          {props.match.ip}
          {props.match.address && <span> / {props.match.address}</span>}
        </span>
      </div>
    </div>
    <div className="match-moderation-actions">
      {(props.canRemove && !props.match.removed) && <RemoveMatchButton {...props}/>}
      {props.match.removed && <MatchRemovedReason {...props}/>}
    </div>
  </div>
);

const Error: React.SFC<{ loading: boolean, error: string | null }> = ({ loading, error }) => {
  if (loading || !error)
    return null;

  return <div className="pt-callout pt-intent-danger"><h5>{error}</h5></div>;
};

const Loader: React.SFC<{ loading: boolean }> = ({ loading }) => {
  if (!loading)
    return null;

  return <NonIdealState visual={<Spinner/>} title="Loading..."/>;
};

export type MatchesPageDispatchProps = {
  readonly refetch: () => any;
  readonly askForReason: (id: number) => any;
  readonly updateReason: (reason: string) => any;
  readonly closeModal: () => any;
  readonly confirmRemove: () => any;
};

export type MatchesPageStateProps = {
  readonly isModerator: boolean;
  readonly username: string;
} & MatchesState;

type MatchesPageProps =
  MatchesPageStateProps & MatchesPageDispatchProps & RouteComponentProps<any>;

const NoMatches: React.SFC = () => (
  <NonIdealState
    title="Nothing to see!"
    visual="geosearch"
    description="There are currently no matches in the queue"
  />
);

class MatchesPageComponent extends React.Component<MatchesPageProps> {
  componentDidMount() {
    this.props.refetch();
  }

  renderMatches = () => this.props.matches.map((match) => {
    const onRemovePress = () => this.props.askForReason(match.id);

    return (
      <MatchRow
        match={match}
        key={match.id}
        onRemovePress={onRemovePress}
        canRemove={this.props.isModerator || this.props.username === match.author}
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
        {this.props.matches.length ? this.renderMatches() : <NoMatches/>}

        <Overlay
          isOpen={this.props.removal.isModalOpen}
          autoFocus
          canEscapeKeyClose
          canOutsideClickClose
          hasBackdrop
          inline={false}
          onClose={this.props.closeModal}
        >
          <div className="pt-card pt-elevation-4 remove-match-modal">
            <h3>Are you sure you want to remove this game? This cannot be undone</h3>

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
              onClick={this.props.confirmRemove}
              disabled={!validReason || this.props.removal.fetching}
              iconName="delete"
            >
              Remove
            </Button>
          </div>
        </Overlay>
      </div>
    );
  }
}

function mapStateToProps(state: ApplicationState): MatchesPageStateProps {
  return {
    ...state.matches,
    isModerator: contains('moderator', state.authentication.data!.accessTokenClaims.permissions),
    username: state.authentication.data!.accessTokenClaims.username,
  };
}

function mapDispatchToProps(dispatch: Dispatch<ApplicationState>): MatchesPageDispatchProps {
  return {
    refetch: () => dispatch(MatchesActions.refetch()),
    confirmRemove: () => dispatch(MatchesActions.confirmRemove()),
    updateReason: (reason: string) => dispatch(MatchesActions.updateReason(reason)),
    closeModal: () => dispatch(MatchesActions.closeModal()),
    askForReason: (id: number) => dispatch(MatchesActions.askForReason(id)),
  };
}

export const MatchesPage: React.ComponentClass<RouteComponentProps<any>> =
  connect<MatchesPageStateProps, MatchesPageDispatchProps, RouteComponentProps<any>>(
    mapStateToProps,
    mapDispatchToProps,
  )(MatchesPageComponent);
