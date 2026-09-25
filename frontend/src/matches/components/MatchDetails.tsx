import { Classes, Intent, NonIdealState, Spinner, Tag, Button, H2, H4, H5 } from '@blueprintjs/core';
import {
  ChartBarIcon,
  CheckIcon,
  CubeIcon,
  GlobeIcon,
  MagnifyingGlassIcon,
  TagIcon,
  TrashIcon,
  UsersIcon,
  WarningIcon,
} from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import { HTTPError } from 'ky';
import React, { useCallback, useState } from 'react';

import { isHostingAdvisorAtom, usernameAtom } from '../../atoms/authentication';
import { ClipboardControlGroup } from '../../components/clipboard-control-group';
import { HostStatus } from '../../components/host-status';
import { Markdown } from '../../components/Markdown';
import { TeamStyle } from '../../components/team-style';
import { UsernameLink } from '../../components/UsernameLink';
import { MatchesData } from '../../matches/api';
import { MatchOpens } from '../../time/components/MatchOpens';
import { TimeFromNowTag } from '../../time/components/TimeFromNowTag';

import { ApprovalModal } from './ApprovalModal';
import { RemovalModal } from './RemovalModal';
import { RemovedInfo } from './RemovedInfo';
import { RemovedTag } from './RemovedTag';

export interface MatchDetailsProps {
  id: number;
}

export const MatchDetails: React.FC<MatchDetailsProps> = ({ id }) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const username = useAtomValue(usernameAtom);
  const isHostingAdvisor = useAtomValue(isHostingAdvisorAtom);

  const { data, isFetching, error } = useQuery(MatchesData.getById(id));

  const canModify = data && !data.removed && !data.approvedBy;

  const canApprove = canModify && isHostingAdvisor;
  const canRemove = canModify && (isHostingAdvisor || (username != null && username === data.author));

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
      return <NonIdealState icon={<MagnifyingGlassIcon />} title="Not found" />;
    }

    return <NonIdealState icon={<WarningIcon />} title="Error loading data" />;
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
              <ChartBarIcon /> Tournament
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
              <UsersIcon /> <TeamStyle size={size} style={teams} custom={customStyle} />
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
              <CheckIcon /> Approved by /u/{approvedBy}
            </H5>
          </div>
        )}

        {(canApprove || canRemove) && (
          <div className={`${Classes.BUTTON_GROUP} ${Classes.MINIMAL} ${Classes.LARGE}`}>
            {canApprove && (
              <Button
                intent={Intent.SUCCESS}
                icon={<CheckIcon />}
                title="Approve Match"
                onClick={() => {
                  setIsApproving(true);
                }}
              />
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
        {isApproving && (
          <ApprovalModal
            id={data.id}
            onClose={() => {
              setIsApproving(false);
            }}
          />
        )}
      </div>
    </div>
  );
};
