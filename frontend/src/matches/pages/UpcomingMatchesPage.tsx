import { H1 } from '@blueprintjs/core';
import { useQuery } from '@tanstack/react-query';

import dayjs from '../../dayjs';
import { MatchListing } from '../../matches/components/MatchListing';
import { MatchesData } from '../api';

const dontLoadMore = () => {
  throw new Error('Should not be called');
};

export const UpcomingMatchesPage = () => {
  const { data, error, isFetching, refetch, dataUpdatedAt } = useQuery(MatchesData.upcoming);

  return (
    <div>
      <title>uhc.gg | Upcoming Matches</title>
      <H1>Upcoming Matches</H1>
      <MatchListing
        matches={data ?? []}
        error={error}
        loading={isFetching}
        refetch={() => {
          void refetch();
        }}
        hasMore={false}
        loadMore={dontLoadMore}
        lastUpdated={dataUpdatedAt ? dayjs.unix(dataUpdatedAt / 1000) : null}
      />
    </div>
  );
};
