import * as React from 'react';
import { Button, Callout, H1, Intent, NonIdealState, Spinner } from '@blueprintjs/core';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ExistingHostApplication } from './ExistingHostApplication';
import { useEffect, useMemo } from 'react';
import { HostApplications } from '../actions';
import { getHostApplicationPermissions, getHostApplicationsListState } from '../selectors';

export const HostApplicationsPage = React.memo(function HostApplicationsPage() {
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
            <Button intent={Intent.PRIMARY} icon="add">
              Apply to host
            </Button>
          </Link>
        </div>
      )}

      {isFetching ? (
        <Spinner />
      ) : data.length === 0 ? (
        <NonIdealState
          icon="inbox"
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
});
