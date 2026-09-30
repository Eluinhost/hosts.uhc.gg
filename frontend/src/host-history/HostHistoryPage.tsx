import { Title } from '@mantine/core';
import { useInfiniteQuery } from '@tanstack/react-query';

import dayjs from '@/dayjs';
import { MatchesData } from '@/matches/api';
import { MatchListing } from '@/matches/components/MatchListing';

export const HostHistoryPage = ({ host }: { host: string }) => {
  const { data, error, isPending, hasNextPage, fetchNextPage, refetch, dataUpdatedAt } = useInfiniteQuery(
    MatchesData.hostHistory(host),
  );

  return (
    <div>
      <title>{`uhc.gg | Hosting History - ${host}`}</title>
      <Title order={1}>Hosting history for /u/{host}</Title>

      <p>
        Matches are in reverse order by date they were <em>created.</em>
      </p>

      <MatchListing
        matches={data?.pages.flat() ?? []}
        error={error}
        loading={isPending}
        hasMore={hasNextPage}
        loadMore={() => {
          void fetchNextPage();
        }}
        refetch={() => {
          void refetch();
        }}
        lastUpdated={dataUpdatedAt ? dayjs.unix(dataUpdatedAt / 1000) : null}
      />
    </div>
  );
};
