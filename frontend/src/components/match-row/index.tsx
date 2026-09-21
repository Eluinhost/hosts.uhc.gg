import { Button, Classes, H4, Intent, Tag } from '@blueprintjs/core';
import {
  ConfirmIcon,
  CubeIcon,
  PeopleIcon,
  TagIcon,
  TickIcon,
  TimelineBarChartIcon,
  TrashIcon,
} from '@blueprintjs/icons';
import React, { useCallback, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router';

import { ApproveMatch } from '../../actions';
import type { Match } from '../../models/Match';
import { getUsername, getPermissions } from '../../state/Selectors';
import { HostStatus } from '../host-status';
import { HoverSwap } from '../HoverSwap';
import { RemovalModal } from '../removal-modal';
import { TagList } from '../tag-list';
import { TeamStyle } from '../team-style';
import { MatchOpensTag } from '../time/MatchOpensTag';
import { TimeFromNowTag } from '../time/TimeFromNowTag';
import { UsernameLink } from '../UsernameLink';

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
  const permissions = useSelector(getPermissions);
  const username = useSelector(getUsername);

  const canApprove = permissions.includes('hosting advisor');
  const canRemove = canApprove || (username != null && username === match.author);

  const dispatch = useDispatch();

  const [isRemoving, setIsRemoving] = useState(false);

  const openApprovalModal = useCallback((id: number) => dispatch(ApproveMatch.openDialog(id)), [dispatch]);

  const onApprovePress = useCallback(
    (event: React.MouseEvent<HTMLElement>): void => {
      event.stopPropagation();
      event.preventDefault();

      openApprovalModal(match.id);
    },
    [openApprovalModal, match.id],
  );

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
    <div className={`match-row ${Classes.CARD} ${Classes.INTERACTIVE} ${match.removed ? Classes.INTENT_DANGER : ''}`}>
      <div className="match-top-left-ribbon">
        <MatchOpensTag opens={match.opens} created={match.created} />
        <TimeFromNowTag time={match.opens} className={`${Classes.LARGE} match-opens`} title="Opens" />
        <Tag intent={Intent.SUCCESS} className={`${Classes.LARGE} match-region`} title="Region / Location">
          <HoverSwap>
            <span>{match.region}</span>
            <span>{match.location}</span>
          </HoverSwap>
        </Tag>
        {match.id !== 0 && (
          <Tag intent={Intent.SUCCESS} className={Classes.LARGE} title="Unique ID">
            {match.id}
          </Tag>
        )}
      </div>
      <div className="match-top-right-ribbon">
        <HostStatus roles={match.roles} />
        <TagList intent={Intent.PRIMARY} title="Tag" items={match.tags} icon={<TagIcon />} />
        {match.tournament && (
          <Tag intent={Intent.PRIMARY} className={Classes.LARGE}>
            <TimelineBarChartIcon /> Tournament
          </Tag>
        )}
      </div>
      <div className="match-content">
        <H4>
          <UsernameLink username={match.author} override={authorElement(match)} />
          {!!match.hostingName && <span> {match.hostingName}</span>}
          <span>&#39;s</span>
          <span> #{match.count}</span>
        </H4>
        <div className="match-tags">
          <Tag intent={Intent.PRIMARY} size="large" title={`Server version: ${match.mainVersion}`}>
            <CubeIcon />
            &nbsp;&nbsp;<b>{match.version || match.mainVersion}</b>
          </Tag>
          <Tag intent={Intent.DANGER} size="large">
            <PeopleIcon /> <TeamStyle size={match.size} style={match.teams} custom={match.customStyle} />
          </Tag>
          <TagList intent={Intent.NONE} title="Scenario" items={match.scenarios} />
        </div>
        <div className="server-tags">
          {!!match.ip && <ServerTag title="Server IP" text={match.ip} />}
          {!!match.address && <ServerTag title="Server Address" text={match.address} />}
          <ServerTag title="slots" text={`${match.slots} Slots`} />
          <ServerTag title="Map Size" text={`${match.mapSize}x${match.mapSize}`} />
          <ServerTag title="PVP Enabled/Meetup @" text={`${match.pvpEnabledAt}m / ${match.length}m`} />
        </div>
      </div>
      {match.removed && <RemovedReason match={match} />}

      {/* Only show actions if the match isn't removed. Removed matches shouldn't be modified */}
      {!match.removed && (
        <div className="match-moderation-actions">
          <div className={`${Classes.BUTTON_GROUP} ${Classes.MINIMAL} ${Classes.VERTICAL} ${Classes.LARGE}`}>
            {!disableApproval && canApprove && !match.approvedBy && (
              <Button intent={Intent.SUCCESS} icon={<ConfirmIcon />} title="Approve Match" onClick={onApprovePress} />
            )}

            {!!match.approvedBy && (
              <Button intent={Intent.SUCCESS} title={`Approved by /u/${match.approvedBy}`} active icon={<TickIcon />} />
            )}

            {!disableRemoval && canRemove && (
              <Button intent={Intent.DANGER} icon={<TrashIcon />} onClick={onRemovePress} title="Remove" />
            )}
          </div>
        </div>
      )}
    </div>
  );

  const removal = isRemoving && (
    <RemovalModal
      id={match.id}
      onClose={() => {
        setIsRemoving(false);
      }}
    />
  );

  if (disableLink)
    return (
      <>
        {card}
        {removal}
      </>
    );

  return (
    <>
      <Link to={`/m/${match.id}`} className="match-row-link">
        {card}
      </Link>
      {removal}
    </>
  );
};
