import React, { useCallback } from 'react';
import { ApplicationState } from '../../state/ApplicationState';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from 'reselect';
import { MatchListing } from '../match-listing';
import { Title } from '../Title';
import { UpdateUpcoming } from '../../actions';
import { H1 } from '@blueprintjs/core';

const dontLoadMore = () => {
  throw new Error('Should not be called');
};

const stateSelector = createSelector(
  (state: ApplicationState) => state.upcoming,
  state => state,
);

export const UpcomingMatchesPage = React.memo(() => {
  const { matches, error, fetching, updated } = useSelector(stateSelector);
  const dispatch = useDispatch();

  const refetch = useCallback(() => dispatch(UpdateUpcoming.start()), [dispatch]);

  return (
    <div>
      <Title>Upcoming Matches</Title>
      <H1>Upcoming Matches</H1>
      <MatchListing
        matches={matches}
        error={error}
        loading={fetching}
        refetch={refetch}
        autoRefreshSeconds={60}
        hasMore={false}
        loadMore={dontLoadMore}
        lastUpdated={updated}
      />
    </div>
  );
});
