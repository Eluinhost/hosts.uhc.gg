import { Alert, Button, EmptyState, Group, Loader, Switch, TextInput, Stack } from '@mantine/core';
import { XIcon, MagnifyingGlassIcon, ArrowClockwiseIcon } from '@phosphor-icons/react';
import { useAtom, useAtomValue } from 'jotai';
import { type ChangeEvent, type FC, type ReactElement, useCallback, useMemo, useState } from 'react';

import { usernameAtom } from '../../authentication/atoms/authentication';
import { type Dayjs } from '../../dayjs';
import { MatchRow } from '../../matches/components/MatchRow';
import type { Match } from '../../models/Match';
import { hideRemovedAtom, showOwnRemovedAtom } from '../atoms/removedMatches';

import { RefreshButton } from './RefreshButton';

type MatchListingProps = {
  readonly matches: Match[];
  readonly loading: boolean;
  readonly error: Error | null;
  readonly refetch: () => void;
  readonly loadMore: () => void;
  readonly lastUpdated: Dayjs | null;
  readonly hasMore: boolean;
  readonly disableRemove?: boolean;
  readonly disableApprove?: boolean;
};

export const MatchListing: FC<MatchListingProps> = ({
  matches,
  loading,
  error,
  refetch,
  loadMore,
  lastUpdated,
  hasMore,
  disableRemove,
  disableApprove,
}) => {
  const username = useAtomValue(usernameAtom);
  const [hideRemoved, setHideRemoved] = useAtom(hideRemovedAtom);
  const [showOwnRemoved, setShowOwnRemoved] = useAtom(showOwnRemovedAtom);

  const [search, setSearch] = useState('');

  const renderMatch = useCallback(
    (match: Match): ReactElement => (
      <MatchRow key={match.id} match={match} disableApproval={disableApprove} disableRemoval={disableRemove} />
    ),
    [disableApprove, disableRemove],
  );

  const noMatches = useMemo(
    () =>
      !loading && (
        <EmptyState
          title="Nothing to see!"
          icon={<MagnifyingGlassIcon />}
          description="There are currently no matches"
        />
      ),
    [loading],
  );

  const removedMatchesFilter = useCallback(
    (m: Match): boolean => {
      if (!m.removed || !hideRemoved) {
        return true;
      }
      return showOwnRemoved && m.author === username;
    },
    [hideRemoved, showOwnRemoved, username],
  );

  const searchQueryFilter = useCallback(
    (query: string) =>
      (m: Match): boolean =>
        !query || JSON.stringify(m).toLowerCase().indexOf(query.toLowerCase()) > 0,
    [],
  );

  const handleSearchChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  }, []);

  const clearSearch = useCallback(() => {
    setSearch('');
  }, []);

  const renderSearchTotals = useCallback(
    (showing: number, outOf: number) => {
      if (!search) {
        return undefined;
      }

      return (
        <>
          Showing {showing} of {outOf}.
          <Button variant="subtle" leftSection={<XIcon />} onClick={clearSearch} />
        </>
      );
    },
    [search, clearSearch],
  );

  const afterRemovedFilter = useMemo(() => matches.filter(removedMatchesFilter), [matches, removedMatchesFilter]);

  const afterSearchQuery = useMemo(
    () => afterRemovedFilter.filter(searchQueryFilter(search)),
    [afterRemovedFilter, searchQueryFilter, search],
  );

  const renderedMatches = useMemo(
    () => (afterSearchQuery.length > 0 ? afterSearchQuery.map(renderMatch) : noMatches),
    [afterSearchQuery, renderMatch, noMatches],
  );

  return (
    <Stack mt="lg">
      <Group>
        <Switch
          checked={hideRemoved}
          label="Hide Removed"
          onChange={() => {
            setHideRemoved(prev => !prev);
          }}
        />
        {!!username && hideRemoved && (
          <Switch
            checked={showOwnRemoved}
            label="Show Own Removed"
            onChange={() => {
              setShowOwnRemoved(prev => !prev);
            }}
          />
        )}
      </Group>

      <Group>
        <TextInput
          leftSection={<MagnifyingGlassIcon />}
          value={search}
          onChange={handleSearchChange}
          placeholder="Search"
          size="lg"
          rightSection={renderSearchTotals(afterSearchQuery.length, afterRemovedFilter.length)}
          flex={1}
        />
        <RefreshButton lastUpdated={lastUpdated} onClick={refetch} loading={loading} />
      </Group>

      {!loading && !!error && <Alert color="red" title={error.message} />}

      {loading && matches.length === 0 && <EmptyState icon={<Loader />} title="Loading..." />}

      <Stack gap="xl" mt="xl">
        {renderedMatches}
      </Stack>

      {hasMore && (
        <Group justify="center">
          <Button
            loading={loading}
            disabled={loading}
            onClick={loadMore}
            leftSection={<ArrowClockwiseIcon />}
            color="green"
          >
            Load more
          </Button>
        </Group>
      )}
    </Stack>
  );
};
