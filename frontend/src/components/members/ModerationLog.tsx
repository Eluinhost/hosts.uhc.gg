import { Button, Callout, Classes, H2, H5, Intent, NonIdealState, Spinner } from '@blueprintjs/core';
import React, { useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from 'reselect';

import { RefreshPermissionModerationLog } from '../../actions';
import { PermissionModerationLogEntry } from '../../models/PermissionModerationLogEntry';
import { ApplicationState } from '../../state/ApplicationState';
import { MatchOpens } from '../time/MatchOpens';

const renderRow = (row: PermissionModerationLogEntry) => (
  <Callout
    key={row.id}
    className={`moderation-log-entry ${Classes.MONOSPACE_TEXT}`}
    intent={row.added ? Intent.SUCCESS : Intent.DANGER}
    title={`${row.permission} /u/${row.username}`}
    icon={row.added ? 'add' : 'remove'}
  >
    Actioned by {row.modifier} @ <MatchOpens time={row.at} />
  </Callout>
);

const stateSelector = createSelector(
  (state: ApplicationState) => state.permissionModerationLog,
  it => it,
);

export const ModerationLog: React.FC = () => {
  const { fetching, log, error } = useSelector(stateSelector);
  const dispatch = useDispatch();

  const refresh = useCallback(() => dispatch(RefreshPermissionModerationLog.start()), [dispatch]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (fetching) return <NonIdealState icon={<Spinner />} title="Loading..." />;

  return (
    <div className="moderation-log">
      <H2>Moderation Log</H2>
      {log.map(renderRow)}
      {!!error && (
        <div className={`${Classes.CALLOUT} ${Classes.INTENT_DANGER}`}>
          <H5>{error}</H5>
        </div>
      )}
      <Button disabled={fetching} onClick={refresh} icon="refresh" intent={Intent.SUCCESS}>
        Refresh
      </Button>
    </div>
  );
};
