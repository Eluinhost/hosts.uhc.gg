import { EmptyState, Loader, Badge, Button, Title, Card, Stack, Group, Alert, TextInput } from '@mantine/core';
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
        <Badge size="lg" bdrs="sm" color="blue" leftSection={<TagIcon />} title={`Tag: ${tag}`} key={index}>
          {tag}
        </Badge>
      )),
    [],
  );

  const renderScenarios = useCallback(
    (scenarios: string[]): React.ReactElement[] =>
      scenarios.map((scenario, index) => (
        <Badge color="grey" size="lg" bdrs="sm" title={`Scenario: ${scenario}`} key={index}>
          {scenario}
        </Badge>
      )),
    [],
  );

  if (isFetching) return <Loader />;

  if (error) {
    if (error instanceof HTTPError && error.response.status === 404) {
      return <EmptyState icon={<MagnifyingGlassIcon />} title="Not found" />;
    }

    return <EmptyState icon={<WarningIcon />} title="Error loading data" />;
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

  const approvalsGroup = (
    <Group justify="end">
      {(canApprove || canRemove) && (
        <Group justify="end">
          {canApprove && (
            <Button
              color="green"
              leftSection={<CheckIcon />}
              onClick={() => {
                setIsApproving(true);
              }}
            >
              Approve Match
            </Button>
          )}
          {canRemove && (
            <Button
              color="red"
              leftSection={<TrashIcon />}
              onClick={() => {
                setIsRemoving(true);
              }}
            >
              Remove
            </Button>
          )}
        </Group>
      )}
    </Group>
  );

  return (
    <Card withBorder>
      <Stack align="stretch">
        <title>{`uhc.gg | ${hostingName || author}'s #${count}`}</title>
        <Group>
          <TimeFromNowTag time={opens} title="Opens" />
          <Badge bdrs="sm" color="green" title="Region - Location" size="lg" leftSection={<GlobeIcon />}>
            {region} - {location}
          </Badge>
          <HostStatus roles={roles} />
          {tournament && (
            <Badge bdrs="sm" color="blue" size="lg" leftSection={<ChartBarIcon />}>
              Tournament
            </Badge>
          )}
          <RemovedTag match={data} />
        </Group>

        <Stack align="center">
          <Title order={2}>
            {hostingName || author}&#39;s #{count}
          </Title>
          <Title order={4}>
            <MatchOpens time={opens} />
          </Title>
          <UsernameLink username={author} />
        </Stack>

        <Group>
          <Badge color="red" size="lg" bdrs="sm" title="Team style" leftSection={<UsersIcon />}>
            <TeamStyle size={size} style={teams} custom={customStyle} />
          </Badge>
          <Badge size="lg" bdrs="sm" color="blue" title={`Server version: ${version}`} leftSection={<CubeIcon />}>
            {version}
          </Badge>
          {renderTags(tags)}
        </Group>
        <Group>{renderScenarios(scenarios)}</Group>

        <Group>
          <TextInput flex={1} label="PVP @" value={`${pvpEnabledAt} minutes`} readOnly />
          <TextInput flex={1} label="Meetup @" value={`${length} minutes`} readOnly />
          <TextInput flex={1} label="Map" value={`${mapSize} x ${mapSize}`} readOnly />
          <TextInput flex={1} label="Slots" value={`${slots} slots`} readOnly />
        </Group>

        <Group justify="center">
          {!!ip && <ClipboardControlGroup value={ip} label="IP Address" />}

          {!!address && <ClipboardControlGroup value={address} label="Server Address" />}
        </Group>

        <Group>
          <RemovedInfo match={data} />
          {!removed && !!approvedBy && (
            <Alert flex={1} color="green" title={`Approved by /u/${approvedBy}`} icon={<CheckIcon />} />
          )}
        </Group>

        {approvalsGroup}

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

        {approvalsGroup}
      </Stack>
    </Card>
  );
};
