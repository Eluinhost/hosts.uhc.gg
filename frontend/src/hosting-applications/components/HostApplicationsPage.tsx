import { Button, Callout, H1, Intent, NonIdealState, Spinner } from '@blueprintjs/core';
import { AddIcon, InboxIcon } from '@blueprintjs/icons';
import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router';

import { HostApplications } from '../actions';
import { getHostApplicationPermissions, getHostApplicationsListState } from '../selectors';

import { ExistingHostApplication } from './ExistingHostApplication';

export const HostApplicationsPage = () => {
  const { canApply, isBanned, canReview, username } = useSelector(getHostApplicationPermissions);
  const { data, error, isFetching } = useSelector(getHostApplicationsListState);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(HostApplications.fetch.list.start());
  }, [dispatch]);

  const sorted = useMemo(() => {
    if (!username) return data;

    const mine = data.filter(application => application.username === username);
    const others = data.filter(application => application.username !== username);
    return [...mine, ...others];
  }, [data, username]);

  return (
    <div>
      <H1>Host Applications</H1>

      {error && <Callout intent={Intent.DANGER}>{error}</Callout>}

      {isBanned && (
        <Callout intent={Intent.DANGER} style={{ marginBottom: 20 }}>
          You are banned from hosting and cannot submit an application.
        </Callout>
      )}

      {canApply && (
        <div style={{ marginBottom: 20 }}>
          <Link to="/host-applications/apply">
            <Button intent={Intent.PRIMARY} icon={<AddIcon />}>
              Apply to host
            </Button>
          </Link>
        </div>
      )}

      {isFetching ? (
        <Spinner />
      ) : data.length === 0 ? (
        <NonIdealState
          icon={<InboxIcon />}
          title="No host applications yet"
          description="There are no host applications to see yet."
        />
      ) : (
        sorted.map(application => (
          <ExistingHostApplication
            application={application}
            key={application.id}
            canReview={canReview}
            isOwn={application.username === username}
          />
        ))
      )}
    </div>
  );
};
