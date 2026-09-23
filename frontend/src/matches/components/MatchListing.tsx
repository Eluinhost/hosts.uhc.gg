import { Button, Callout, H5, InputGroup, Intent, NonIdealState, Spinner, Switch } from '@blueprintjs/core';
import { CrossIcon, GeosearchIcon, RefreshIcon, SearchIcon } from '@blueprintjs/icons';
import { useAtom, useAtomValue } from 'jotai';
import { type ChangeEvent, type FC, type ReactElement, useCallback, useMemo, useState } from 'react';

import { usernameAtom } from '../../atoms/authentication';
import { hideRemovedAtom, showOwnRemovedAtom } from '../../atoms/removedMatches';
import { type Dayjs } from '../../dayjs';
import { ApprovalModal } from '../../matches/components/ApprovalModal';
import { MatchRow } from '../../matches/components/MatchRow';
import type { Match } from '../../models/Match';

import { RefreshButton } from './RefreshButton';

import './MatchListing.sass';

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
        <NonIdealState title="Nothing to see!" icon={<GeosearchIcon />} description="There are currently no matches" />
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
          <Button variant="minimal" icon={<CrossIcon />} onClick={clearSearch} />
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
    <div className="match-listing">
      <div className="match-listing__filters">
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
      </div>

      <div className="match-listing__search">
        <InputGroup
          leftIcon={<SearchIcon />}
          fill
          value={search}
          onChange={handleSearchChange}
          placeholder="Search"
          rightElement={renderSearchTotals(afterSearchQuery.length, afterRemovedFilter.length)}
        />
        <RefreshButton lastUpdated={lastUpdated} onClick={refetch} loading={loading} />
      </div>

      {!loading && !!error && (
        <Callout intent={Intent.DANGER}>
          <H5>{error.message}</H5>
        </Callout>
      )}

      {loading && matches.length === 0 && <NonIdealState icon={<Spinner />} title="Loading..." />}

      <div className="match-listing__matches">{renderedMatches}</div>

      {hasMore && (
        <div className="match-listing__footer-actions">
          <Button
            loading={loading}
            disabled={loading}
            onClick={loadMore}
            icon={<RefreshIcon />}
            intent={Intent.SUCCESS}
            text="Load more"
          />
        </div>
      )}

      <ApprovalModal />
    </div>
  );
};
