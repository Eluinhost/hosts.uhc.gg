import * as React from 'react';
import { Match } from '../../Match';
import { TeamStyle } from './TeamStyle';
import { renderTagList } from './renderTagList';
import { Intent, Tag } from '@blueprintjs/core';
import { RemovedReason } from './RemovedReason';
import { RemoveMatchButton } from './RemoveMatchButton';

export type MatchRowProps = {
  readonly match: Match;
  readonly onRemovePress: () => any;
  readonly canRemove: boolean;
};

const ServerTag: React.SFC<{ title: string, text: string }> = ({ title, text }) => (
  <Tag intent={Intent.PRIMARY} className="pt-minimal pt-large" title={title}>{text}</Tag>
);

export const MatchRow: React.SFC<MatchRowProps> = props => (
  <div className={`pt-card match-row ${props.match.removed ? 'pt-intent-danger' : ''}`}>
    <div className="match-top-left-ribbon">
      <span className="pt-tag pt-large pt-intent-success match-opens" title="Opens">
        {props.match.opens.format('MMM DD HH:mm')}
      </span>
      <span className="pt-tag pt-large pt-intent-success match-region" title="Region">
        {props.match.region}
      </span>
      <span className="pt-tag pt-large pt-intent-success" title="Location">
        {props.match.location}
      </span>
      <span className="pt-tag pt-large pt-intent-success" title="Unique ID">
        {props.match.id}
      </span>
    </div>
    <div className="match-moderation-actions">
      {(props.canRemove && !props.match.removed) && <RemoveMatchButton onPress={props.onRemovePress} />}
    </div>
    <div className="match-content">
      <h4>
        <span>{props.match.author}</span>
        <span> #{props.match.count}</span>
      </h4>
      <h5>
        <TeamStyle size={props.match.size} style={props.match.teams} custom={props.match.customStyle} />
        <span title="Map Size"> - {props.match.mapSizeX}x{props.match.mapSizeZ}</span>
        <span title="Version"> - {props.match.version}</span>
      </h5>
      <h6>
        <span>Length: {props.match.length}m</span>
        <span> | PVP: {props.match.pvpEnabledAt}m</span>
      </h6>
      <div className="match-tags">
        {renderTagList(Intent.WARNING, 'tags', props.match.tags)}
        {renderTagList(Intent.DANGER, 'scenarios', props.match.scenarios)}
      </div>
      <div className="server-tags">
        <ServerTag title="Server IP" text={props.match.ip} />
        {props.match.address && <ServerTag title="Server Address" text={props.match.address} />}
        <ServerTag title="slots" text={`${props.match.slots} Slots`}/>
      </div>
    </div>
    {props.match.removed && <RemovedReason reason={props.match.removedReason!} removedBy={props.match.removedBy!} />}
  </div>
);
