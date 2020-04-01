import { BanEntry } from '../../models/BanEntry';
import { AutoSizer, List, ListRowProps, WindowScroller } from 'react-virtualized';
import { Callout, Classes, H5, InputGroup, NonIdealState, Spinner } from '@blueprintjs/core';
import * as React from 'react';
import { UblEntryRow } from './UblEntryRow';
import { filter, propEq, complement, always, map, when, toLower, curry, any, pipe } from 'ramda';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { ApplicationState } from '../../state/ApplicationState';
import { getAccessToken, isDarkMode } from '../../state/Selectors';
import { Intent } from '@blueprintjs/core/lib/esm/common/intent';

type UblListingStateProps = {
  readonly accessToken: string | null;
  readonly isDarkMode: boolean;
};

type UblListingProps = {
  readonly refetch: () => Promise<BanEntry[]>;
  readonly onListUpdate?: (bans: BanEntry[]) => void;
};

type State = {
  readonly bans: BanEntry[];
  readonly backup: BanEntry[] | null;
  readonly error: string | null;
  readonly loading: boolean;
  readonly filter: string;
  readonly filtered: BanEntry[];
};

const caseInsensitiveContains = curry(
  (needle: string, haystack: string) => toLower(haystack).indexOf(toLower(needle)) > -1,
);

class UblListingComponent extends React.PureComponent<UblListingProps & UblListingStateProps, State> {
  state = {
    bans: [],
    backup: null,
    error: null,
    loading: false,
    filter: '',
    filtered: [],
  };

  componentDidMount() {
    this.loadData();
  }

  loadData = () => {
    this.setState(prev => ({
      error: null,
      loading: true,
    }));

    this.props
      .refetch()
      .then(bans =>
        this.setState(prev => ({
          bans,
          filtered: this.filterBans(prev.filter, bans),
          loading: false,
          error: null,
        })),
      )
      .catch(err =>
        this.setState({
          error: 'Failed to fetch list from server',
          loading: false,
        }),
      );
  };

  // Delete immediately + store backup list
  onRowDeleteStart = (ban: BanEntry) =>
    this.setState(prev => {
      const bans = filter(complement(propEq('id', ban.id)), prev.bans);

      if (this.props.onListUpdate) this.props.onListUpdate(bans);

      return {
        bans,
        filtered: this.filterBans(prev.filter, bans),
        backup: prev.bans,
      };
    });

  // make the change immediately + save backup
  onRowEditStart = (newBan: BanEntry, oldBan: BanEntry) =>
    this.setState(prev => {
      const bans = map(when(propEq('id', oldBan.id), always(newBan)), prev.bans);

      if (this.props.onListUpdate) this.props.onListUpdate(bans);

      return {
        bans,
        filtered: this.filterBans(prev.filter, bans),
        backup: prev.bans,
      };
    });

  // Clear backup on confirm
  onRowDeleted = () =>
    this.setState({
      backup: null,
    });

  // clear backup
  onRowEdited = () =>
    this.setState({
      backup: null,
    });

  // restore from backup
  onRowDeleteFailed = (ban: BanEntry) =>
    this.setState(prev => {
      if (this.props.onListUpdate) this.props.onListUpdate(prev.backup!);

      return {
        bans: prev.backup!,
        filtered: this.filterBans(prev.filter, prev.backup!),
        backup: null,
      };
    });

  // restore from backup
  onRowEditFailed = (newBan: BanEntry, oldBan: BanEntry) =>
    this.setState(prev => {
      if (this.props.onListUpdate) this.props.onListUpdate(prev.backup!);

      return {
        bans: prev.backup!,
        filtered: this.filterBans(prev.filter, prev.backup!),
        backup: null,
      };
    });

  renderRow = (props: ListRowProps) => {
    const ban = this.state.filtered[props.index];

    return (
      <div style={props.style} key={props.key}>
        <UblEntryRow
          ban={ban}
          onDeleteStart={this.onRowDeleteStart}
          onDeleted={this.onRowDeleted}
          onDeleteFailed={this.onRowDeleteFailed}
          onEditStart={this.onRowEditStart}
          onEdited={this.onRowEdited}
          onEditFailed={this.onRowEditFailed}
          accessToken={this.props.accessToken}
          disabled={this.state.loading || this.state.backup !== null}
          isDarkMode={this.props.isDarkMode}
        />
      </div>
    );
  };

  onFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilter = e.target.value;

    this.setState(prev => ({
      filter: newFilter,
      filtered: this.filterBans(newFilter, prev.bans),
    }));
  };

  filterBans = (filterString: string, bans: BanEntry[]): BanEntry[] => {
    if (filterString === '') return bans;

    const filterPred = caseInsensitiveContains(filterString);

    return filter<BanEntry>(
      pipe((ban: BanEntry) => [ban.ign, ban.uuid, ban.reason, ban.link], any(filterPred)),
      bans,
    );
  };

  render() {
    return (
      <div style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
        <InputGroup
          intent={this.state.filter !== '' ? Intent.PRIMARY : Intent.NONE}
          type="text"
          className={Classes.INPUT}
          placeholder="Filter this list... (ign, uuid, reason, link)"
          value={this.state.filter}
          onChange={this.onFilterChange}
          leftIcon="filter"
        />
        {this.state.loading && (
          <div style={{ flexGrow: 0 }}>
            <NonIdealState title="Loading..." icon={<Spinner />} />
          </div>
        )}

        {!!this.state.error && (
          <Callout style={{ flexGrow: 0 }} intent={Intent.DANGER}>
            <H5>{this.state.error}</H5>
          </Callout>
        )}

        <div style={{ flex: '1 0 auto' }}>
          <WindowScroller>
            {({ height, scrollTop }) => (
              <AutoSizer disableHeight>
                {({ width }) => (
                  <List
                    renderHelper={this.props}
                    renderHelper2={this.state}
                    autoHeight
                    height={height}
                    rowCount={this.state.filtered.length}
                    rowHeight={110}
                    rowRenderer={this.renderRow}
                    scrollTop={scrollTop}
                    width={width}
                  />
                )}
              </AutoSizer>
            )}
          </WindowScroller>
        </div>
      </div>
    );
  }
}

const stateSelector = createSelector<ApplicationState, string | null, boolean, UblListingStateProps>(
  getAccessToken,
  isDarkMode,
  (accessToken, isDarkMode) => ({ accessToken, isDarkMode }),
);

export const UblListing: React.ComponentType<UblListingProps> = connect<UblListingStateProps, {}, UblListingProps>(
  stateSelector,
  always({}),
)(UblListingComponent);
