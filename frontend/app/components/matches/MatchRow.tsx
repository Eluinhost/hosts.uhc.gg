import * as React from 'react';
import { Match } from '../../Match';
import { TeamStyle } from './TeamStyle';
import { renderTagList } from './renderTagList';
import { Button, Dialog, Intent, Tag } from '@blueprintjs/core';
import { RemovedReason } from './RemovedReason';
import { Markdown } from '../Markdown';
import { If } from '../If';

export type MatchRowProps = {
  readonly match: Match;
  readonly onRemovePress: () => void;
  readonly onApprovePress: () => void;
  readonly canRemove: boolean;
};

export type MatchRowState = {
  readonly isOpen: boolean;
};

const ServerTag: React.SFC<{ title: string, text: string }> = ({ title, text }) => (
  <Tag intent={Intent.PRIMARY} className="pt-minimal pt-large" title={title}>{text}</Tag>
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

  render() {
    const { match, canRemove } = this.props;

    return (
      <div className={`pt-card match-row ${match.removed ? 'pt-intent-danger' : ''}`} onClick={this.onClick}>
        <div className="match-top-left-ribbon">
          <span className="pt-tag pt-large pt-intent-success match-opens" title="Opens">
            {match.opens.format('MMM DD HH:mm z')}
          </span>
          <span className="pt-tag pt-large pt-intent-success match-region" title="Region">
            {match.region}
          </span>
          <span className="pt-tag pt-large pt-intent-success" title="Location">
            {match.location}
          </span>
          <span className="pt-tag pt-large pt-intent-success" title="Unique ID">
            {match.id}
          </span>
        </div>
        <div className="match-content">
          <h4>
            <span>{match.author}</span>
            <span> #{match.count}</span>
          </h4>
          <h5>
            <TeamStyle size={match.size} style={match.teams} custom={match.customStyle}/>
            <span title="Map Size"> - {match.mapSizeX}x{match.mapSizeZ}</span>
            <span title="Version"> - {match.version}</span>
          </h5>
          <h6>
            <span>Length: {match.length}m</span>
            <span> | PVP: {match.pvpEnabledAt}m</span>
          </h6>
          <div className="match-tags">
            {renderTagList(Intent.WARNING, 'tags', match.tags)}
            {renderTagList(Intent.DANGER, 'scenarios', match.scenarios)}
          </div>
          <div className="server-tags">
            <ServerTag title="Server IP" text={match.ip}/>
            <If condition={!!match.address}>
              <ServerTag title="Server Address" text={match.address!}/>
            </If>
            <ServerTag title="slots" text={`${match.slots} Slots`}/>
          </div>
        </div>
        <If condition={match.removed}>
          <RemovedReason reason={match.removedReason!} removedBy={match.removedBy!}/>
        </If>
        <div className="match-moderation-actions">
          <If condition={!match.removed}>
            <span>
              <If condition={canRemove && !match.approvedBy}>
                <Button
                  intent={Intent.SUCCESS}
                  rightIconName="tick"
                  onClick={this.onApprovePress}
                >
                  Approve
                </Button>
              </If>

              <If condition={!!match.approvedBy}>
                <Tag
                  className="pt-large pt-minimal"
                  intent={Intent.SUCCESS}
                  title={`Approved by /u/${match.approvedBy}`}
                >
                  Approved
                </Tag>
              </If>

              <If condition={canRemove}>
                <span>
                  <Button
                    intent={Intent.DANGER}
                    rightIconName="delete"
                    onClick={this.onRemovePress}
                  >
                    Remove
                  </Button>

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
                </span>
              </If>
            </span>
          </If>
        </div>
      </div>
    );
  }
}
