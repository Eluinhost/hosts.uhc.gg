import * as React from 'react';
import { Button, Callout, H5, InputGroup, Intent, NonIdealState, Spinner, Switch } from '@blueprintjs/core';
import { RemovalModal } from '../removal-modal';
import { ApprovalModal } from '../approval-modal';
import { Match } from '../../models/Match';
import { MatchRow } from '../match-row';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector, Selector } from 'reselect';
import { ApplicationState } from '../../state/ApplicationState';
import { getUsername } from '../../state/Selectors';
import { Settings } from '../../actions';
import moment from 'moment-timezone';
import { RefreshButton } from './RefreshButton';
import { VisibilityDetector } from '../../services/VisibilityDetector';

import './match-listing.sass';
import { ChangeEvent, FC, ReactElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';

type MatchListingProps = {
  readonly matches: Match[];
  readonly loading: boolean;
  readonly error: string | null;
  readonly refetch: () => void;
  readonly loadMore: () => void;
  readonly lastUpdated: moment.Moment | null;
  readonly autoRefreshSeconds?: number;
  readonly hasMore: boolean;
  readonly disableRemove?: boolean;
  readonly disableApprove?: boolean;
};

type StateSlice = {
  readonly hideRemoved: boolean;
  readonly showOwnRemoved: boolean;
  readonly username: string | null;
};

const stateSliceSelector: Selector<ApplicationState, StateSlice> = createSelector(
  getUsername,
  state => state.settings.hideRemoved,
  state => state.settings.showOwnRemoved,
  (username, hideRemoved, showOwnRemoved): StateSlice => ({
    username,
    hideRemoved,
    showOwnRemoved,
  }),
);

export const MatchListing: FC<MatchListingProps> = React.memo(({
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
  const { hideRemoved, showOwnRemoved, username } = useSelector(stateSliceSelector);
  const dispatch = useDispatch();

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
        timerIdRef.current = window.setInterval(refetch, autoRefreshSeconds! * 1000);
      }

      // data is stale if it has never been updated or the last update was before the refresh timer allows
      const isDataStale: boolean =
        lastUpdated === null ||
        (autoRefreshSeconds !== undefined && moment.utc().diff(lastUpdated, 'seconds') > autoRefreshSeconds);

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
      <MatchRow
        key={match.id}
        match={match}
        disableApproval={disableApprove}
        disableRemoval={disableRemove}
      />
    ),
    [disableApprove, disableRemove],
  );

  const noMatches = !loading && (
    <NonIdealState title="Nothing to see!" icon="geosearch" description="There are currently no matches" />
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
    (query: string) => (m: Match): boolean => !query || JSON.stringify(m).toLowerCase().indexOf(query.toLowerCase()) > 0,
    [],
  );

  const handleSearchChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setSearch(event.target.value),
    [],
  );

  const clearSearch = useCallback(() => setSearch(''), []);

  const renderSearchTotals = useCallback(
    (showing: number, outOf: number) => {
      if (!search) {
        return undefined;
      }

      return (
        <>
          Showing {showing} of {outOf}.
          <Button minimal icon="cross" onClick={clearSearch} />
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

  const toggleHideRemoved = useCallback(() => dispatch(Settings.toggleHideRemoved()), [dispatch]);
  const toggleShowOwnRemoved = useCallback(() => dispatch(Settings.toggleShowOwnRemoved()), [dispatch]);

  return (
    <div className="match-listing">
      <div className="match-listing__filters">
        <Switch checked={hideRemoved} label="Hide Removed" onChange={toggleHideRemoved} />
        {!!username && hideRemoved && (
          <Switch checked={showOwnRemoved} label="Show Own Removed" onChange={toggleShowOwnRemoved} />
        )}
      </div>

      <div className="match-listing__search">
        <InputGroup
          leftIcon="search"
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
            icon="refresh"
            intent={Intent.SUCCESS}
            text="Load more"
          />
        </div>
      )}

      <RemovalModal />
      <ApprovalModal />
    </div>
  );
});
