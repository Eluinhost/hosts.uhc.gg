import { H1 } from '@blueprintjs/core';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';

import dayjs from '../../dayjs';
import { MatchesData } from '../../matches/api';
import { MatchListing } from '../../matches/components/MatchListing';

type RouteParams = {
  readonly host: string;
};

export const HistoryPage = () => {
  const { host } = useParams<RouteParams>();
  const { data, error, isPending, hasNextPage, fetchNextPage, refetch, dataUpdatedAt } = useInfiniteQuery({
    enabled: !!host,
    ...MatchesData.hostHistory(host ?? ''),
  });

  if (!host) return null;

  return (
    <div>
      <title>{`uhc.gg | Hosting History - ${host}`}</title>
      <H1>Hosting history for /u/{host}</H1>

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
