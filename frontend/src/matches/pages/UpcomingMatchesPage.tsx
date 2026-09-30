import { Title } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';

import dayjs from '@/dayjs';
import { MatchesData } from '@/matches/api';
import { MatchListing } from '@/matches/components/MatchListing';

const dontLoadMore = () => {
  throw new Error('Should not be called');
};

export const UpcomingMatchesPage = () => {
  const { data, error, isFetching, refetch, dataUpdatedAt } = useQuery(MatchesData.upcoming);

  return (
    <div>
      <title>uhc.gg | Upcoming Matches</title>
      <Title order={1}>Upcoming Matches</Title>
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
