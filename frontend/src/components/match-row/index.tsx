import * as React from 'react';
import { Match } from '../../models/Match';
import { TeamStyle } from '../team-style';
import { TagList } from '../tag-list';
import { Button, Classes, H4, Icon, Intent, Tag } from '@blueprintjs/core';
import { RemovedReason } from './RemovedReason';
import { UsernameLink } from '../UsernameLink';
import { Link } from 'react-router-dom';
import { TimeFromNowTag } from '../time/TimeFromNowTag';
import { HoverSwap } from '../HoverSwap';
import { MatchOpensTag } from '../time/MatchOpensTag';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { createSelector, ParametricSelector } from 'reselect';
import { ApplicationState } from '../../state/ApplicationState';
import { getUsername, matchesPermissions } from '../../state/Selectors';
import { ApproveMatch, RemoveMatch } from '../../actions';
import { ServerTag } from './ServerTag';

type MatchRowProps = {
  readonly match: Match;
  readonly disableLink?: boolean;
  readonly disableRemoval?: boolean;
  readonly disableApproval?: boolean;
};

type StateProps = {
  readonly canRemove: boolean;
  readonly canApprove: boolean;
};

type DispatchProps = {
  readonly openRemovalModal: (id: number) => void;
  readonly openApprovalModal: (id: number) => void;
};

class MatchRowComponent extends React.PureComponent<MatchRowProps & StateProps & DispatchProps> {
  private onApprovePress = (event: React.MouseEvent<HTMLElement>): void => {
    event.stopPropagation();
    event.preventDefault();

    this.props.openApprovalModal(this.props.match.id);
  };

  private onRemovePress = (event: React.MouseEvent<HTMLElement>): void => {
    event.stopPropagation();
    event.preventDefault();

    this.props.openRemovalModal(this.props.match.id);
  };

  private authorElement = (m: Match): React.ReactElement => {
    if (m.hostingName) return <small>/u/{m.author}</small>;

    return <span>/u/{m.author}</span>;
  };

  public render() {
    const { match, canRemove, canApprove, disableApproval, disableRemoval, disableLink } = this.props;

    const card = (
      <div className={`match-row ${Classes.CARD} ${Classes.INTERACTIVE} ${match.removed ? Classes.INTENT_DANGER : ''}`}>
        <div className="match-top-left-ribbon">
          <MatchOpensTag opens={match.opens} created={match.created} />
          <TimeFromNowTag time={match.opens} className={`${Classes.LARGE} match-opens`} title="Opens" />
          <Tag intent={Intent.SUCCESS} className={`${Classes.LARGE} match-region`} title="Region / Location">
            <HoverSwap>
              <span>{match.region}</span>
              <span>{match.location}</span>
            </HoverSwap>
          </Tag>
          {match.id !== 0 && (
            <Tag intent={Intent.SUCCESS} className={`${Classes.LARGE}`} title="Unique ID">
              {match.id}
            </Tag>
          )}
        </div>
        <div className="match-top-right-ribbon">
          <TagList intent={Intent.PRIMARY} title="Tag" items={match.tags} icon="tag" />
          {match.tournament && (
            <Tag intent={Intent.PRIMARY} className={`${Classes.LARGE}`}>
              <Icon icon="timeline-bar-chart" /> Tournament
            </Tag>
          )}
        </div>
        <div className="match-content">
          <H4>
            <UsernameLink username={match.author} override={this.authorElement(match)} />
            {!!match.hostingName && <span> {match.hostingName}</span>}
            <span>'s</span>
            <span> #{match.count}</span>
          </H4>
          <div className="match-tags">
            <Tag intent={Intent.PRIMARY} large title={`Server version: ${match.mainVersion}`}>
              <Icon icon="cube" />
              &nbsp;&nbsp;<b>{match.version || match.mainVersion}</b>
            </Tag>
            <Tag intent={Intent.DANGER} large>
              <Icon icon="people" /> <TeamStyle size={match.size} style={match.teams} custom={match.customStyle} />
            </Tag>
            <TagList intent={Intent.NONE} title="Scenario" items={match.scenarios} />
          </div>
          <div className="server-tags">
            {!!match.ip && <ServerTag title="Server IP" text={match.ip!} />}
            {!!match.address && <ServerTag title="Server Address" text={match.address!} />}
            <ServerTag title="slots" text={`${match.slots} Slots`} />
            <ServerTag title="Map Size" text={`${match.mapSize}x${match.mapSize}`} />
            <ServerTag title="PVP Enabled/Meetup @" text={`${match.pvpEnabledAt}m / ${match.length}m`} />
          </div>
        </div>
        {match.removed && <RemovedReason match={match} />}

        {/* Only show actions if the match isn't removed. Removed matches shouldn't be modified */}
        {!match.removed && (
          <div className="match-moderation-actions">
            <div className={`${Classes.BUTTON_GROUP} ${Classes.MINIMAL} ${Classes.VERTICAL} ${Classes.LARGE}`}>
              {!disableApproval && canApprove && !match.approvedBy && (
                <Button intent={Intent.SUCCESS} icon="confirm" title="Approve Match" onClick={this.onApprovePress} />
              )}

              {!!match.approvedBy && (
                <Button intent={Intent.SUCCESS} title={`Approved by /u/${match.approvedBy}`} active icon="tick" />
              )}

              {!disableRemoval && canRemove && (
                <Button intent={Intent.DANGER} icon="trash" onClick={this.onRemovePress} title="Remove" />
              )}
            </div>
          </div>
        )}
      </div>
    );

    if (disableLink) return card;

    return (
      <Link to={`/m/${match.id}`} className="match-row-link">
        {card}
      </Link>
    );
  }
}

const stateSelector: ParametricSelector<ApplicationState, MatchRowProps | undefined, StateProps> = createSelector(
  matchesPermissions('hosting advisor'),
  getUsername,
  (_: ApplicationState, props: MatchRowProps | undefined) => props!.match.author,
  (isHostingAdvisor, username, author) => ({
    canApprove: isHostingAdvisor,
    canRemove: isHostingAdvisor || (username != null && username === author),
  }),
);

const dispatch = (dispatch: Dispatch): DispatchProps => ({
  openApprovalModal: (id: number) => dispatch(ApproveMatch.openDialog(id)),
  openRemovalModal: (id: number) => dispatch(RemoveMatch.openDialog(id)),
});

export const MatchRow: React.ComponentType<MatchRowProps> = connect<StateProps, DispatchProps, MatchRowProps>(
  stateSelector,
  dispatch,
)(MatchRowComponent);
