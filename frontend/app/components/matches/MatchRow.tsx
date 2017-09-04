import * as React from 'react';
import { Match } from '../../Match';
import { TeamStyle } from './TeamStyle';
import { TagList } from './TagList';
import { Button, Dialog, Icon, Intent, Tag } from '@blueprintjs/core';
import { RemovedReason } from './RemovedReason';
import { Markdown } from '../Markdown';
import { If } from '../If';
import { UsernameLink } from '../UsernameLink';

export type MatchRowProps = {
  readonly match: Match;
  readonly onRemovePress: () => void;
  readonly onApprovePress: () => void;
  readonly canRemove: boolean;
  readonly canApprove: boolean;
};

export type MatchRowState = {
  readonly isOpen: boolean;
};

const ServerTag: React.SFC<{ title: string, text: string }> = ({ title, text }) => (
  <Tag intent={Intent.PRIMARY} className="pt-minimal" title={title}>{text}</Tag>
);

export class MatchRow extends React.Component<MatchRowProps, MatchRowState> {
  state = {
    isOpen: false,
  };

  onClick = (): void => this.setState(prev => ({ isOpen: !prev.isOpen }));

  onApprovePress = (event: React.MouseEvent<HTMLElement>): void => {
    event.stopPropagation();
    this.props.onApprovePress();
  }

  onRemovePress = (event: React.MouseEvent<HTMLElement>): void => {
    event.stopPropagation();
    this.props.onRemovePress();
  }

  authorElement = (m: Match): React.ReactElement<any> => {
    if (m.hostingName)
      return <small>/u/{m.author}</small>;

    return <span>/u/{m.author}</span>;
  }

  render() {
    const { match, canRemove } = this.props;

    return (
      <div
        className={`pt-card match-row pt-interactive ${match.removed ? 'pt-intent-danger' : ''}`}
        onClick={this.onClick}
      >
        <div className="match-top-left-ribbon">
          <Tag
            intent={Intent.SUCCESS}
            className="pt-large match-opens"
            title={`Created @ ${match.created.format('MMM DD HH:mm z')}`}
          >
            {match.opens.format('MMM DD HH:mm z')}
          </Tag>
          <Tag intent={Intent.SUCCESS} className="pt-large match-region" title="Region">
            {match.region}
          </Tag>
          <Tag intent={Intent.SUCCESS} className="pt-large" title="Location">
            {match.location}
          </Tag>
          <Tag intent={Intent.SUCCESS} className="pt-large" title="Unique ID">
            {match.id}
          </Tag>
        </div>
        <div className="match-top-right-ribbon">
          <Tag intent={Intent.PRIMARY} className="pt-large">
            <TeamStyle size={match.size} style={match.teams} custom={match.customStyle}/>
          </Tag>
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
            <TagList intent={Intent.WARNING} title="Tag" items={match.tags} />
            <TagList intent={Intent.DANGER} title="Scenario" items={match.scenarios} />
          </div>
          <div className="server-tags">
            <ServerTag title="Server IP" text={match.ip}/>
            <If condition={!!match.address}>
              <ServerTag title="Server Address" text={match.address!}/>
            </If>
            <ServerTag title="slots" text={`${match.slots} Slots`} />
            <ServerTag title="Map Size" text={`${match.mapSize}x${match.mapSize}`} />
            <ServerTag title="Version" text={match.version} />
            <ServerTag title="PVP Enabled/Match length" text={`${match.pvpEnabledAt}m / ${match.length}m`}/>
          </div>
        </div>
        <If condition={match.removed}>
          <RemovedReason reason={match.removedReason!} removedBy={match.removedBy!}/>
        </If>
        <Dialog
          isOpen={this.state.isOpen}
          onClose={this.onClick}
          title={`${match.author}'s #${match.count}`}
          className="match-row-dialog pt-dark"
        >
          <div className="pt-dialog-body">
            <Markdown markdown={match.content} />
          </div>
        </Dialog>

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
  }
}
