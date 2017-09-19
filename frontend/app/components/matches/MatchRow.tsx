import * as React from 'react';
import { Match } from '../../Match';
import { TeamStyle } from './TeamStyle';
import { TagList } from './TagList';
import { Button, Icon, Intent, Tag } from '@blueprintjs/core';
import { RemovedReason } from './RemovedReason';
import { If } from '../If';
import { UsernameLink } from '../UsernameLink';
import { Link } from 'react-router-dom';
import { TimeFromNowTag } from '../time/TimeFromNowTag';
import { HoverSwap } from '../HoverSwap';
import { MatchOpensTag } from '../time/MatchOpensTag';

export type MatchRowProps = {
  readonly match: Match;
  readonly onRemovePress: () => void;
  readonly onApprovePress: () => void;
  readonly canRemove: boolean;
  readonly canApprove: boolean;
  readonly doNotLink?: boolean;
};

const ServerTag: React.SFC<{ title: string, text: string }> = ({ title, text }) => (
  <Tag intent={Intent.PRIMARY} className="pt-minimal" title={title}>{text}</Tag>
);

export class MatchRow extends React.PureComponent<MatchRowProps> {
  onApprovePress = (event: React.MouseEvent<HTMLElement>): void => {
    event.stopPropagation();
    event.preventDefault();
    this.props.onApprovePress();
  }

  onRemovePress = (event: React.MouseEvent<HTMLElement>): void => {
    event.stopPropagation();
    event.preventDefault();
    this.props.onRemovePress();
  }

  authorElement = (m: Match): React.ReactElement<any> => {
    if (m.hostingName)
      return <small>/u/{m.author}</small>;

    return <span>/u/{m.author}</span>;
  }

  render() {
    const { match, canRemove, doNotLink } = this.props;

    const card = (
      <div className={`pt-card match-row pt-interactive ${match.removed ? 'pt-intent-danger' : ''}`}>
        <div className="match-top-left-ribbon">
          <MatchOpensTag opens={match.opens} created={match.created} />
          <TimeFromNowTag time={match.opens} className="pt-large match-opens" title="Opens"/>
          <Tag intent={Intent.SUCCESS} className="pt-large match-region" title="Region / Location">
            <HoverSwap>
              <span>{match.region}</span>
              <span>{match.location}</span>
            </HoverSwap>
          </Tag>
          <If condition={match.id !== 0}>
            <Tag intent={Intent.SUCCESS} className="pt-large" title="Unique ID">
              {match.id}
            </Tag>
          </If>
        </div>
        <div className="match-top-right-ribbon">
          <TagList intent={Intent.PRIMARY} title="Tag" items={match.tags} iconName="tag" />
          <If condition={match.tournament}>
            <Tag intent={Intent.PRIMARY} className="pt-large">
              <Icon iconName="timeline-bar-chart"/> Tournament
            </Tag>
          </If>
        </div>
        <div className="match-content">
          <h4>
            <UsernameLink username={match.author} override={this.authorElement(match)} />

            <If condition={!!match.hostingName}>
              <span> {match.hostingName}</span>
            </If>

            <span>'s</span>

            <span> #{match.count}</span>
          </h4>
          <div className="match-tags">
            <Tag intent={Intent.DANGER} className="pt-large">
              <Icon iconName="people" /> <TeamStyle size={match.size} style={match.teams} custom={match.customStyle}/>
            </Tag>
            <TagList intent={Intent.NONE} title="Scenario" items={match.scenarios} />
          </div>
          <div className="server-tags">
            <If condition={!!match.ip}>
              <ServerTag title="Server IP" text={match.ip!}/>
            </If>
            <If condition={!!match.address}>
              <ServerTag title="Server Address" text={match.address!}/>
            </If>
            <ServerTag title="slots" text={`${match.slots} Slots`} />
            <ServerTag title="Map Size" text={`${match.mapSize}x${match.mapSize}`} />
            <ServerTag title="Version" text={match.version} />
            <ServerTag title="PVP Enabled/Meetup @" text={`${match.pvpEnabledAt}m / ${match.length}m`}/>
          </div>
        </div>
        <If condition={match.removed}>
          <RemovedReason reason={match.removedReason!} removedBy={match.removedBy!}/>
        </If>

        {/* Only show actions if the match isn't removed. Removed matches shouldn't be modified */}
        <If condition={!match.removed}>
          <div className="match-moderation-actions">
            <div className="pt-button-group pt-minimal pt-vertical pt-large">
              <If condition={this.props.canApprove && !match.approvedBy}>
                <Button
                  intent={Intent.SUCCESS}
                  iconName="confirm"
                  title="Approve Match"
                  onClick={this.onApprovePress}
                />
              </If>

              <If condition={!!match.approvedBy}>
                <Button
                  intent={Intent.SUCCESS}
                  title={`Approved by /u/${match.approvedBy}`}
                  active
                  iconName="tick"
                />
              </If>

              <If condition={canRemove}>
                <Button
                  intent={Intent.DANGER}
                  iconName="trash"
                  onClick={this.onRemovePress}
                  title="Remove"
                />
              </If>
            </div>
          </div>
        </If>
      </div>
    );

    if (doNotLink)
      return card;

    return (
      <Link to={`/m/${match.id}`} className="match-row-link">
        {card}
      </Link>
    );
  }
}
