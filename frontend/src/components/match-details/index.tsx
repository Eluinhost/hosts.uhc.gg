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
import { useQuery } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import { HTTPError } from 'ky';
import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';

import { ApproveMatch } from '../../actions';
import { isHostingAdvisorAtom, usernameAtom } from '../../atoms/authentication';
import { MatchesData } from '../../matches/api';
import { MatchOpens } from '../../time/components/MatchOpens';
import { TimeFromNowTag } from '../../time/components/TimeFromNowTag';
import { ClipboardControlGroup } from '../clipboard-control-group';
import { HostStatus } from '../host-status';
import { Markdown } from '../Markdown';
import { RemovalModal } from '../removal-modal';
import { TeamStyle } from '../team-style';
import { UsernameLink } from '../UsernameLink';

import { RemovedInfo } from './RemovedInfo';
import { RemovedTag } from './RemovedTag';

export interface MatchDetailsProps {
  id: number;
}

export const MatchDetails: React.FC<MatchDetailsProps> = ({ id }) => {
  const dispatch = useDispatch();
  const [isRemoving, setIsRemoving] = useState(false);
  const username = useAtomValue(usernameAtom);
  const isHostingAdvisor = useAtomValue(isHostingAdvisorAtom);

  const { data, isFetching, error } = useQuery(MatchesData.getById(id));

  const canModify = data && !data.removed && !data.approvedBy;

  const canApprove = canModify && isHostingAdvisor;
  const canRemove = canModify && (isHostingAdvisor || (username != null && username === data.author));

  const approve = useCallback(() => dispatch(ApproveMatch.openDialog(id)), [id, dispatch]);

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

  if (isFetching) return <Spinner />;

  if (error) {
    if (error instanceof HTTPError && error.response.status === 404) {
      return <NonIdealState icon={<GeosearchIcon />} title="Not found" />;
    }

    return <NonIdealState icon={<WarningSignIcon />} title="Error loading data" />;
  }

  if (!data) {
    return null;
  }

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
    roles,
  } = data;

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
          <RemovedTag match={data} />
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
            <Tag intent={Intent.PRIMARY} title={`Server version: ${version}`} size="large">
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
        <RemovedInfo match={data} />
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
            id={data.id}
            onClose={() => {
              setIsRemoving(false);
            }}
          />
        )}
      </div>
    </div>
  );
};
