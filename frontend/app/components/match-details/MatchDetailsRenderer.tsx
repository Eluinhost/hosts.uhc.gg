import { Match } from '../../Match';
import * as React from 'react';
import { Icon, Intent, Tag } from '@blueprintjs/core';
import { addIndex, map } from 'ramda';
import { UsernameLink } from '../UsernameLink';
import { TeamStyle } from '../matches/TeamStyle';
import { If } from '../If';
import { ClipboardControlGroup } from './ClipboardControlGroup';
import { Markdown } from '../Markdown';
import { TimeFromNowTag } from '../TimeFromNowTag';

const renderScenarios = (scenarios: string[]): React.ReactElement<any>[] => addIndex(map)(
  (scenario, index) => <Tag intent={Intent.NONE} className="pt-large" title="Scenario" key={index}>{scenario}</Tag>,
  scenarios,
);

const renderTags = (tags: string[]): React.ReactElement<any>[] => addIndex(map)(
  (tag, index) => (
    <Tag intent={Intent.PRIMARY} className="pt-large" title="Tag" key={index}>
      <Icon iconName="tag"/> {tag}
    </Tag>
  ),
  tags,
);

type Props = {
  readonly match: Match;
};

export const MatchDetailsRenderer: React.SFC<Props> =
  ({ match: {
    opens, region, location, hostingName, author, count, tags, pvpEnabledAt, mapSize, slots, removed,
    size, teams, customStyle, tournament, scenarios, ip, address, content, length, version, removedBy, removedReason,
  }}) => (
    <div className="pt-card match-details">
      <div className="match-details__header">
        <div className="match-details__header__floating-tags__top">
          <TimeFromNowTag time={opens} className="pt-large" title="Opens"/>
          <Tag intent={Intent.SUCCESS} title="Region - Location" className="pt-large">
            <Icon iconName="globe" /> {region} - {location}
          </Tag>
          <If condition={tournament}>
            <Tag intent={Intent.PRIMARY} className="pt-large">
              <Icon iconName="timeline-bar-chart"/> Tournament
            </Tag>
          </If>
          <If condition={removed}>
            <Tag intent={Intent.DANGER} className="pt-large">
              <Icon iconName="warning-sign"/> REMOVED
            </Tag>
          </If>
        </div>

        <div className="match-details__header__content">
          <h2>{hostingName || author}'s #{count}</h2>
          <h4>{opens.format('MMM Do YYYY - HH:mm')}</h4>
          <UsernameLink username={author} />
        </div>

        <div className="match-details__header__floating-tags__bottom">
          <div>
            <Tag intent={Intent.DANGER} title="Team style" className="pt-large">
              <Icon iconName="people"/> <TeamStyle size={size} style={teams} custom={customStyle}/>
            </Tag>
            <Tag intent={Intent.PRIMARY} title="Version" className="pt-large">
              <Icon iconName="settings"/> {version}
            </Tag>
            {renderTags(tags)}
          </div>
          <div className="match-details__scenarios">
            {renderScenarios(scenarios)}
          </div>
        </div>
      </div>
      <div className="match-details__server-address">
        <If condition={!!ip}>
          <ClipboardControlGroup value={ip!} />
        </If>

        <If condition={!!address}>
          <ClipboardControlGroup value={address!} />
        </If>
      </div>
      <div className="match-details__extra-info">
        <label className="pt-label">
          PVP @
          <input className="pt-input pt-fill" type="text" value={`${pvpEnabledAt} minutes`} readOnly />
        </label>

        <label className="pt-label">
          Meetup @
          <input className="pt-input pt-fill" type="text" value={`${length} minutes`} readOnly />
        </label>

        <label className="pt-label">
          Map
          <input className="pt-input pt-fill" type="text" value={`${mapSize} x ${mapSize}`} readOnly />
        </label>
        <label className="pt-label">
          Slots
          <input className="pt-input pt-fill" type="text" value={`${slots} slots`} readOnly />
        </label>
      </div>
      <div className="match-details__content">
        <If condition={removed}>
          <div className="pt-callout pt-intent-danger">
            <h5><Icon iconName="warning-sign"/> REMOVED</h5>
            <p>This game is no longer on the calendar:</p>
            <p>{removedReason} - /u/{removedBy}</p>
          </div>
        </If>
        <Markdown markdown={content} />
      </div>
    </div>
  );
