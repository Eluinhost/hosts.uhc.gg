import * as React from 'react';
import { Match } from '../../Match';
import { TeamStyle } from './TeamStyle';
import { renderTagList } from './renderTagList';
import { Intent } from '@blueprintjs/core';
import { RemovedReason } from './RemovedReason';
import { RemoveMatchButton } from './RemoveMatchButton';

export type MatchRowProps = {
  readonly match: Match;
  readonly onRemovePress: () => any;
  readonly canRemove: boolean;
};

export const MatchRow: React.SFC<MatchRowProps> = props => (
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
        {renderTagList(Intent.WARNING, 'tags', props.match.tags)}
        {renderTagList(Intent.DANGER, 'scenarios', props.match.tags)}
      </div>
      <div className="match-addresses">
        <span className="pt-tag pt-minimal pt-intent-primary pt-large" title="Server Address">
          {props.match.ip}
          {props.match.address && <span> / {props.match.address}</span>}
        </span>
      </div>
    </div>
    <div className="match-moderation-actions">
      {(props.canRemove && !props.match.removed) && <RemoveMatchButton onPress={props.onRemovePress} />}
      {props.match.removed && <RemovedReason reason={props.match.removedReason!} removedBy={props.match.removedBy!} />}
    </div>
  </div>
);
