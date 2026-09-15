import { H1 } from '@blueprintjs/core';
import { useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router';
import { createSelector } from 'reselect';

import { LoadHostHistory } from '../../actions';
import type { ApplicationState } from '../../state/ApplicationState';
import { MatchListing } from '../match-listing';
import { Title } from '../Title';

type RouteParams = {
  readonly host: string;
};

const hostHistorySelector = createSelector(
  (state: ApplicationState) => state.hostHistory,
  hostHistory => hostHistory,
);

export const HistoryPage = () => {
  const { matches, error, fetching, hasMorePages, updated } = useSelector(hostHistorySelector);
  const dispatch = useDispatch();

  const { host } = useParams<RouteParams>();

  const reload = useCallback(() => {
    if (host) {
      dispatch(LoadHostHistory.start({ host, refresh: true }));
    }
  }, [dispatch, host]);

  const next = useCallback(() => {
    if (host) {
      dispatch(LoadHostHistory.start({ host, refresh: false }));
    }
  }, [dispatch, host]);

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
};
