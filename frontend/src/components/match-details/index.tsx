import { Classes, Intent, NonIdealState, Spinner, Tag, Button, H2, H4, H5 } from '@blueprintjs/core';
import {
  ConfirmIcon,
  CubeIcon,
  GeosearchIcon,
  GlobeIcon,
  PeopleIcon,
  TagIcon,
  TickIcon,
  TimelineBarChartIcon,
  TrashIcon,
  WarningSignIcon,
} from '@blueprintjs/icons';
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { ApproveMatch, FetchMatchDetails } from '../../actions';
import type { ApplicationState } from '../../state/ApplicationState';
import { getPermissions, getUsername } from '../../state/Selectors';
import { ClipboardControlGroup } from '../clipboard-control-group';
import { HostStatus } from '../host-status';
import { Markdown } from '../Markdown';
import { RemovalModal } from '../removal-modal';
import { TeamStyle } from '../team-style';
import { MatchOpens } from '../time/MatchOpens';
import { TimeFromNowTag } from '../time/TimeFromNowTag';
import { UsernameLink } from '../UsernameLink';

import { RemovedInfo } from './RemovedInfo';
import { RemovedTag } from './RemovedTag';

export interface MatchDetailsProps {
  id: number;
}

export const MatchDetails: React.FC<MatchDetailsProps> = ({ id }) => {
  const dispatch = useDispatch();
  const [isRemoving, setIsRemoving] = useState(false);
  const username = useSelector(getUsername);
  const permissions = useSelector(getPermissions);
  const details = useSelector((state: ApplicationState) => state.matchDetails);

  const canModify = details.match !== null && !details.match.removed && !details.match.approvedBy;

  const canApprove = canModify && permissions.includes('hosting advisor');
  const canRemove =
    canModify && (permissions.includes('hosting advisor') || (username != null && username === details.match.author));

  const clear = useCallback(() => dispatch(FetchMatchDetails.clear()), [dispatch]);

  const load = useCallback((matchId: number) => dispatch(FetchMatchDetails.start({ id: matchId })), [dispatch]);

  const approve = useCallback(() => dispatch(ApproveMatch.openDialog(id)), [id, dispatch]);

  useEffect(() => {
    clear();
    load(id);

    return () => {
      clear();
    };
  }, [id, clear, load]);

  const renderTags = useCallback(
    (tags: string[]): React.ReactElement[] =>
      tags.map((tag, index) => (
        <Tag intent={Intent.PRIMARY} className={Classes.LARGE} title="Tag" key={index}>
          <TagIcon /> {tag}
        </Tag>
      )),
    [],
  );

  const renderScenarios = useCallback(
    (scenarios: string[]): React.ReactElement[] =>
      scenarios.map((scenario, index) => (
        <Tag intent={Intent.NONE} className={Classes.LARGE} title="Scenario" key={index}>
          {scenario}
        </Tag>
      )),
    [],
  );

  if (details.fetching) return <Spinner />;

  if (details.error) return <NonIdealState icon={<WarningSignIcon />} title="Error loading data" />;

  if (details.match == null) return <NonIdealState icon={<GeosearchIcon />} title="Not found" />;

  const {
    opens,
    region,
    location,
    hostingName,
    author,
    count,
    tags,
    pvpEnabledAt,
    mapSize,
    slots,
    removed,
    size,
    teams,
    customStyle,
    tournament,
    scenarios,
    ip,
    address,
    content,
    length,
    version,
    approvedBy,
    mainVersion,
    roles,
  } = details.match;

  return (
    <div className={`${Classes.CARD} match-details`}>
      <title>{`uhc.gg | ${hostingName || author}'s #${count}`}</title>
      <div className="match-details__header">
        <div className="match-details__header__floating-tags__top">
          <TimeFromNowTag time={opens} className={Classes.LARGE} title="Opens" />
          <Tag intent={Intent.SUCCESS} title="Region - Location" className={Classes.LARGE}>
            <GlobeIcon /> {region} - {location}
          </Tag>
          <HostStatus roles={roles} />
          {tournament && (
            <Tag intent={Intent.PRIMARY} className={Classes.LARGE}>
              <TimelineBarChartIcon /> Tournament
            </Tag>
          )}
          <RemovedTag match={details.match} />
        </div>

        <div className="match-details__header__content">
          <H2>
            {hostingName || author}&#39;s #{count}
          </H2>
          <H4>
            <MatchOpens time={opens} />
          </H4>
          <UsernameLink username={author} />
        </div>

        <div className="match-details__header__floating-tags__bottom">
          <div>
            <Tag intent={Intent.DANGER} title="Team style" className={Classes.LARGE}>
              <PeopleIcon /> <TeamStyle size={size} style={teams} custom={customStyle} />
            </Tag>
            <Tag intent={Intent.PRIMARY} title={`Server version: ${mainVersion}`} size="large">
              <CubeIcon /> {version}
            </Tag>
            {renderTags(tags)}
          </div>
          <div className="match-details__scenarios">{renderScenarios(scenarios)}</div>
        </div>
      </div>
      <div className="match-details__server-address">
        {!!ip && <ClipboardControlGroup value={ip} />}

        {!!address && <ClipboardControlGroup value={address} />}
      </div>
      <div className="match-details__extra-info">
        <label className={Classes.LABEL}>
          PVP @
          <input
            className={`${Classes.INPUT} ${Classes.FILL}`}
            type="text"
            value={`${pvpEnabledAt} minutes`}
            readOnly
          />
        </label>

        <label className={Classes.LABEL}>
          Meetup @
          <input className={`${Classes.INPUT} ${Classes.FILL}`} type="text" value={`${length} minutes`} readOnly />
        </label>

        <label className={Classes.LABEL}>
          Map
          <input
            className={`${Classes.INPUT} ${Classes.FILL}`}
            type="text"
            value={`${mapSize} x ${mapSize}`}
            readOnly
          />
        </label>
        <label className={Classes.LABEL}>
          Slots
          <input className={`${Classes.INPUT} ${Classes.FILL}`} type="text" value={`${slots} slots`} readOnly />
        </label>
      </div>
      <div className="match-details__content">
        <RemovedInfo match={details.match} />
        {!removed && !!approvedBy && (
          <div className={`${Classes.CALLOUT} ${Classes.INTENT_SUCCESS}`}>
            <H5>
              <TickIcon /> Approved by /u/{approvedBy}
            </H5>
          </div>
        )}

        {(canApprove || canRemove) && (
          <div className={`${Classes.BUTTON_GROUP} ${Classes.MINIMAL} ${Classes.LARGE}`}>
            {canApprove && (
              <Button intent={Intent.SUCCESS} icon={<ConfirmIcon />} title="Approve Match" onClick={approve} />
            )}
            {canRemove && (
              <Button
                intent={Intent.DANGER}
                icon={<TrashIcon />}
                onClick={() => {
                  setIsRemoving(true);
                }}
                title="Remove"
              />
            )}
          </div>
        )}
        <Markdown markdown={content} />
        {isRemoving && (
          <RemovalModal
            id={details.match.id}
            onClose={() => {
              setIsRemoving(false);
            }}
          />
        )}
      </div>
    </div>
  );
};
