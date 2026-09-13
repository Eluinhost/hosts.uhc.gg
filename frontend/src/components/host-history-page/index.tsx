import React, { useCallback, useEffect } from 'react';
import { useParams } from 'react-router';
import { MatchListing } from '../match-listing';
import { Title } from '../Title';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from 'reselect';
import { ApplicationState } from '../../state/ApplicationState';
import { LoadHostHistory } from '../../actions';
import { H1 } from '@blueprintjs/core';

type RouteParams = {
  readonly host: string;
};

const hostHistorySelector = createSelector(
  (state: ApplicationState) => state.hostHistory,
  hostHistory => hostHistory,
);

export const HistoryPage = React.memo(() => {
  const { matches, error, fetching, hasMorePages, updated } = useSelector(hostHistorySelector);
  const dispatch = useDispatch();

  const { host } = useParams<RouteParams>();

  const reload = useCallback(() => dispatch(LoadHostHistory.start({ host, refresh: true })), [dispatch, host]);

  const next = useCallback(() => dispatch(LoadHostHistory.start({ host, refresh: false })), [dispatch, host]);

  useEffect(() => {
    return () => {
      dispatch(LoadHostHistory.clear());
    };
  }, [dispatch]);

  return (
    <div>
      <Title>Hosting History - {host}</Title>
      <H1>Hosting history for /u/${host}</H1>

      <p>
        Matches are in reverse order by date they were <em>created.</em>
      </p>

      <MatchListing
        matches={matches}
        error={error}
        loading={fetching}
        hasMore={hasMorePages}
        loadMore={next}
        refetch={reload}
        lastUpdated={updated}
      />
    </div>
  );
});
