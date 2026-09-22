import { Button, Callout, H5, InputGroup, Intent, NonIdealState, Spinner, Switch } from '@blueprintjs/core';
import { CrossIcon, GeosearchIcon, RefreshIcon, SearchIcon } from '@blueprintjs/icons';
import { useAtom, useAtomValue } from 'jotai';
import { type ChangeEvent, type FC, type ReactElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { usernameAtom } from '../../atoms/authentication';
import { hideRemovedAtom, showOwnRemovedAtom } from '../../atoms/removedMatches';
import dayjs, { type Dayjs } from '../../dayjs';
import type { Match } from '../../models/Match';
import { VisibilityDetector } from '../../services/VisibilityDetector';
import { ApprovalModal } from '../approval-modal';
import { MatchRow } from '../match-row';

import { RefreshButton } from './RefreshButton';

import './match-listing.sass';

type MatchListingProps = {
  readonly matches: Match[];
  readonly loading: boolean;
  readonly error: string | null;
  readonly refetch: () => void;
  readonly loadMore: () => void;
  readonly lastUpdated: Dayjs | null;
  readonly autoRefreshSeconds?: number;
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
  autoRefreshSeconds,
  hasMore,
  disableRemove,
  disableApprove,
}) => {
  const username = useAtomValue(usernameAtom);
  const [hideRemoved, setHideRemoved] = useAtom(hideRemovedAtom);
  const [showOwnRemoved, setShowOwnRemoved] = useAtom(showOwnRemovedAtom);

  const [search, setSearch] = useState('');

  const timerIdRef = useRef<number | null>(null);
  const visibilityDetectorRef = useRef(new VisibilityDetector());

  const stopTimer = useCallback(() => {
    if (timerIdRef.current) {
      window.clearInterval(timerIdRef.current);
      timerIdRef.current = null;
    }
  }, []);

  const handleVisibilityChange = useCallback(() => {
    // always clear any existing timer first
    stopTimer();

    // if it's visible (or not supported) start the timer if required
    if (!visibilityDetectorRef.current.isHidden()) {
      if (autoRefreshSeconds !== undefined && autoRefreshSeconds < 1) {
        throw new Error("autorefresh shouldn't be < 1");
      }

      // if we are to auto refresh start a timer
      if (autoRefreshSeconds) {
        timerIdRef.current = window.setInterval(refetch, autoRefreshSeconds * 1000);
      }

      // data is stale if it has never been updated or the last update was before the refresh timer allows
      const isDataStale: boolean =
        lastUpdated === null ||
        (autoRefreshSeconds !== undefined && dayjs.utc().diff(lastUpdated, 'seconds') > autoRefreshSeconds);

      if (isDataStale) {
        refetch();
      }
    }
  }, [autoRefreshSeconds, lastUpdated, refetch, stopTimer]);

  useEffect(() => {
    const detector = visibilityDetectorRef.current;
    detector.addEventListener(handleVisibilityChange);
    handleVisibilityChange();

    return () => {
      stopTimer();
      detector.removeEventListener(handleVisibilityChange);
    };
  }, [handleVisibilityChange, stopTimer]);

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
          <H5>{error}</H5>
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
