import { BanEntry } from '../../BanEntry';
import { AutoSizer, List, ListRowProps, WindowScroller } from 'react-virtualized';
import { If } from '../If';
import { NonIdealState, Spinner } from '@blueprintjs/core';
import * as React from 'react';
import { UblEntryRow } from './UblEntryRow';
import { filter, propEq, complement, always, map, when } from 'ramda';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { ApplicationState } from '../../state/ApplicationState';
import { getAccessToken } from '../../state/Selectors';

type UblListingStateProps = {
  readonly accessToken: string | null;
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
};

class UblListingComponent extends React.Component<UblListingProps & UblListingStateProps, State> {
  state = {
    bans: [],
    backup: null,
    error: null,
    loading: false,
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
      .then(bans => this.setState({
        bans,
        loading: false,
        error: null,
      }))
      .catch(err => this.setState({
        error: 'Failed to fetch list from server',
        loading: false,
      }));
  }

  // Delete immediately + store backup list
  onRowDeleteStart = (ban: BanEntry) => this.setState((prev) => {
    const bans = filter(complement(propEq('id', ban.id)), prev.bans);

    if (this.props.onListUpdate)
      this.props.onListUpdate(bans);

    return {
      bans,
      backup: prev.bans,
      working: true,
    };
  })

  // Clear backup on confirm
  onRowDeleted = () => this.setState({
    backup: null,
  })

  // restore from backup
  onRowDeleteFailed = (ban: BanEntry) => this.setState((prev) => {
    if (this.props.onListUpdate)
      this.props.onListUpdate(prev.backup!);

    return {
      bans: prev.backup,
      backup: null,
    };
  })


  // make the change immediately + save backup
  onRowEditStart = (ban: BanEntry, oldBan: BanEntry) => this.setState((prev) => {
    const bans = map(when(propEq('id', oldBan.id), always(ban)), prev.bans);

    if (this.props.onListUpdate)
      this.props.onListUpdate(bans);

    return {
      bans,
      backup: prev.bans,
    };
  })

  // clear backup
  onRowEdited = () => this.setState({
    backup: null,
  })

  // restore from backup
  onRowEditFailed = (ban: BanEntry, oldBan: BanEntry) => this.setState((prev) => {
    if (this.props.onListUpdate)
      this.props.onListUpdate(prev.backup!);

    return {
      bans: prev.backup,
      backup: null,
    };
  })

  renderRow = (props: ListRowProps) => {
    const ban = this.state.bans[props.index];

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
        />
      </div>
    );
  }

  render() {
    return (
      <div style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
        <If condition={this.state.loading}>
          <div style={{ flexGrow: 0 }}>
            <NonIdealState title="Loading..." visual={<Spinner/>}/>
          </div>
        </If>

        <If condition={!!this.state.error}>
          <div style={{ flexGrow: 0 }} className="pt-callout pt-intent-danger"><h5>{this.state.error}</h5></div>
        </If>

        <div style={{ flex: '1 0 auto' }}>
          <WindowScroller>
            {/*tslint:disable-next-line jsx-no-multiline-js*/({ height, isScrolling, scrollTop }) => (
              <AutoSizer disableHeight>
                {/*tslint:disable-next-line jsx-no-multiline-js*/({ width }) => (
                  <List
                    renderHelper={this.props}
                    renderHelper2={this.state}
                    autoHeight
                    height={height}
                    rowCount={this.state.bans.length}
                    rowHeight={110}
                    rowRenderer={this.renderRow}
                    scrollTop={scrollTop}
                    width={width}
                  />
                )}
              </AutoSizer>
            )}
          </WindowScroller >
        </div>
      </div>
    );
  }
}

const stateSelector = createSelector<ApplicationState, string | null, UblListingStateProps>(
  getAccessToken,
  accessToken => ({ accessToken }),
);

export const UblListing: React.ComponentClass<UblListingProps> = connect<UblListingStateProps, {}, UblListingProps>(
  stateSelector,
  always({}),
)(UblListingComponent);
