import { Badge, Card, Group, Stack, Title, Text, ActionIcon } from '@mantine/core';
import { ChartBarIcon, CheckIcon, CubeIcon, TagIcon, TrashIcon, UsersIcon } from '@phosphor-icons/react';
import { useAtomValue } from 'jotai';
import React, { useCallback, useState } from 'react';
import { Link } from 'react-router';

import { permissionsAtom, usernameAtom } from '../../atoms/authentication';
import { HostStatus } from '../../components/host-status';
import { HoverSwap } from '../../components/HoverSwap';
import { TeamStyle } from '../../components/team-style';
import { UsernameLink } from '../../components/UsernameLink';
import type { Match } from '../../models/Match';
import { MatchOpensTag } from '../../time/components/MatchOpensTag';
import { TimeFromNowTag } from '../../time/components/TimeFromNowTag';

import { ApprovalModal } from './ApprovalModal';
import styles from './MatchRow.module.css';
import { RemovalModal } from './RemovalModal';
import { RemovedReason } from './RemovedReason';
import { ServerTag } from './ServerTag';

type MatchRowProps = {
  readonly match: Match;
  readonly disableLink?: boolean;
  readonly disableRemoval?: boolean;
  readonly disableApproval?: boolean;
};

export const MatchRow: React.FC<MatchRowProps> = props => {
  const { match, disableLink, disableRemoval, disableApproval } = props;
  const permissions = useAtomValue(permissionsAtom);
  const username = useAtomValue(usernameAtom);

  const canApprove = (permissions ?? []).includes('hosting advisor');
  const canRemove = canApprove || (username != null && username === match.author);

  const [isRemoving, setIsRemoving] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const onRemovePress = useCallback((event: React.MouseEvent<HTMLElement>): void => {
    event.stopPropagation();
    event.preventDefault();
    setIsRemoving(true);
  }, []);

  const authorElement = (m: Match): React.ReactElement => {
    if (m.hostingName) return <small>/u/{m.author}</small>;

    return <span>/u/{m.author}</span>;
  };

  const card = (
    // <div className={`match-row ${Classes.CARD} ${Classes.INTERACTIVE} ${match.removed ? Classes.INTENT_DANGER : ''}`}>
    <Card className={styles.matchRow} withBorder>
      {/* TODO below a certain breakbpoint these should embed into the card */}
      <Group className={styles.tags} align="start" justify="space-between" gap={0}>
        <Group gap="xs">
          <MatchOpensTag opens={match.opens} created={match.created} />
          <TimeFromNowTag time={match.opens} title="Opens" />
          <Badge bdrs="sm" color="green" size="lg" title="Region / Location">
            <HoverSwap>
              <span>{match.region}</span>
              <span>{match.location}</span>
            </HoverSwap>
          </Badge>
          {match.id !== 0 && (
            <Badge bdrs="sm" color="green" size="lg" title="Unique ID">
              {match.id}
            </Badge>
          )}
        </Group>
        <Group gap="xs">
          <Badge bdrs="sm" color="blue" size="lg" title={`Server version: ${match.version}`} leftSection={<CubeIcon />}>
            <Text fw={700}>{match.version}</Text>
          </Badge>
          <Badge color="red" size="lg" bdrs="sm" leftSection={<UsersIcon />}>
            <TeamStyle size={match.size} style={match.teams} custom={match.customStyle} />
          </Badge>
        </Group>
      </Group>

      <Stack align="center" mt="xs">
        <Title order={4}>
          <UsernameLink username={match.author} override={authorElement(match)} />
          {!!match.hostingName && <span> {match.hostingName}</span>}
          <span>&#39;s</span>
          <span> #{match.count}</span>
        </Title>

        <Group gap="xs">
          <HostStatus roles={match.roles} />
          {match.tags.map((tag, index) => (
            <Badge key={index} color="blue" size="lg" bdrs="sm" leftSection={<TagIcon />}>
              {tag}
            </Badge>
          ))}
          {match.tournament && (
            <Badge color="blue" size="lg" bdrs="sm" leftSection={<ChartBarIcon />}>
              Tournament
            </Badge>
          )}
        </Group>

        <Group gap="xs" align="center">
          {match.scenarios.map(scenario => (
            <Badge bdrs="sm" size="lg" key={scenario} title={`Scenario: ${scenario}`} color="grey">
              {scenario}
            </Badge>
          ))}
        </Group>

        <Group gap="xs">
          {!!match.ip && <ServerTag title="Server IP" text={match.ip} />}
          {!!match.address && <ServerTag title="Server Address" text={match.address} />}
          <ServerTag title="slots" text={`${match.slots} Slots`} />
          <ServerTag title="Map Size" text={`${match.mapSize}x${match.mapSize}`} />
          <ServerTag title="PVP Enabled/Meetup @" text={`${match.pvpEnabledAt}m / ${match.length}m`} />
        </Group>
      </Stack>
      {match.removed && <RemovedReason match={match} />}

      {/* Only show actions if the match isn't removed. Removed matches shouldn't be modified */}
      {!match.removed && (
        <Group className={styles.actions} mr="xs" mb="xs">
          {!disableApproval && canApprove && !match.approvedBy && (
            <ActionIcon
              bdrs={100}
              color="green"
              title="Approve Match"
              onClick={e => {
                e.stopPropagation();
                e.preventDefault();
                setIsApproving(true);
              }}
            >
              <CheckIcon />
            </ActionIcon>
          )}

          {!!match.approvedBy && (
            <ActionIcon bdrs={100} color="green" variant="filled" disabled title={`Approved by /u/${match.approvedBy}`}>
              <CheckIcon />
            </ActionIcon>
          )}

          {!disableRemoval && canRemove && (
            <ActionIcon bdrs={100} color="red" onClick={onRemovePress} title="Remove">
              <TrashIcon />
            </ActionIcon>
          )}
        </Group>
      )}
    </Card>
  );

  const removal = isRemoving && (
    <RemovalModal
      id={match.id}
      onClose={() => {
        setIsRemoving(false);
      }}
    />
  );

  const approval = isApproving && (
    <ApprovalModal
      id={match.id}
      onClose={() => {
        setIsApproving(false);
      }}
    />
  );

  if (disableLink)
    return (
      <>
        {card}
        {removal}
        {approval}
      </>
    );

  return (
    <>
      <Link to={`/m/${match.id}`} className="match-row-link">
        {card}
      </Link>
      {removal}
      {approval}
    </>
  );
};
