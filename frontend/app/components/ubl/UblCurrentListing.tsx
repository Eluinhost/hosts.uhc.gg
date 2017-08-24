import * as React from 'react';
import { BanEntry } from '../../BanEntry';
import { getAllCurrentBans } from '../../api/index';
import { If } from '../If';
import { NonIdealState, Spinner } from '@blueprintjs/core';
import { AutoSizer, List, ListRowProps } from 'react-virtualized';
import { UblEntryRow } from './UblEntryRow';
import { filter, propEq, complement, always, map, when } from 'ramda';

type State = {
  readonly started: boolean;
  readonly listing: BanEntry[];
  readonly error: string | null;
  readonly loading: boolean;
};

export class UblCurrentListing extends React.Component<{}, State> {
  state = {
    started: false,
    listing: [],
    error: null,
    loading: false,
  } as State;

  componentDidMount() {
    this.loadData();
  }

  loadData = () => {
    this.setState({ error: null, loading: true, started: true });

    getAllCurrentBans()
      .then(bans => this.setState({
        loading: false,
        error: null,
        listing: bans,
      }))
      .catch(err => this.setState({
        loading: false,
        error: 'Failed to fetch list from server',
      }));
  }

  onRowDeleted = (id: number) => this.setState(prev => ({
    listing: filter(complement(propEq('id', id)), prev.listing),
  }))

  onRowEdited = (ban: BanEntry, oldBan: BanEntry) => this.setState(prev => ({
    listing: map(when(propEq('id', oldBan.id), always(ban)), prev.listing),
  }))

  renderRow = (props: ListRowProps) => {
    const ban = this.state.listing[props.index];

    return (
      <div style={props.style} key={props.key}>
        <UblEntryRow ban={ban} onDeleted={this.onRowDeleted} onEdited={this.onRowEdited} />
      </div>
    );
  }

  renderList = ({ width, height }: { readonly width: number, readonly height: number }) => (
    <List
      updateHelper={this.state/*not a real prop, used to make sure renders pass through properly*/}
      width={width}
      height={height}
      rowCount={this.state.listing.length}
      rowHeight={100}
      rowRenderer={this.renderRow}
    />
  )

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
          <AutoSizer updateHelper={this.state/*not a real prop, used to make sure renders pass through properly*/}>
            {this.renderList}
          </AutoSizer>
        </div>
      </div>
    );
  }
}
