import * as React from 'react';
import { BanEntry } from '../../BanEntry';
import { getAllCurrentBans } from '../../api/index';
import * as moment from 'moment';
import { If } from '../If';
import { Intent, NonIdealState, Spinner, Tag } from '@blueprintjs/core';
import { toLower, sortWith, prop } from 'ramda';
import {
  Column, Table, Index, SortDirection, SortDirectionType, AutoSizer, List,
  ListRowProps,
} from 'react-virtualized';

type State = {
  readonly started: boolean;
  readonly listing: BanEntry[];
  readonly error: string | null;
  readonly loading: boolean;
  readonly sortBy: keyof BanEntry;
  readonly sortDirection: SortDirectionType;
};

const caseInsensitiveCompare = (a: string, b: string): number => toLower(a).localeCompare(toLower(b));
const dateCompare = (a: moment.Moment, b: moment.Moment): number => a.diff(b);
const numericCompare = (a: number, b: number): number => a - b;

const invertComparator = (fn: (a: any, b: any) => number) => (a: any, b: any) => fn(a, b) * -1;

export class UblCurrentListing extends React.Component<{}, State> {
  state = {
    started: false,
    listing: [],
    error: null,
    loading: false,
    sortBy: 'created',
    sortDirection: SortDirection.DESC,
  } as State;

  componentDidMount() {
    this.loadData();
  }

  sortData = (data: BanEntry[], by: keyof BanEntry, direction: SortDirectionType) => {
    console.log('sort', by, direction);

    let comp: (a: any, b: any) => number = caseInsensitiveCompare;

    if (by === 'created' || by === 'expires') {
      comp = dateCompare;
    } else if (by === 'id') {
      comp = numericCompare;
    }

    if (direction === SortDirection.DESC) {
      comp = invertComparator(comp);
    }

    return sortWith(
      [(a: BanEntry, b: BanEntry): number => comp(prop(by, a), prop(by, b))],
      data,
    );
  }

  onSort = (info: { sortBy: string, sortDirection: SortDirectionType }): void => this.setState(prev => ({
    sortBy: info.sortBy as keyof BanEntry,
    sortDirection: info.sortDirection,
    listing: this.sortData(prev.listing, info.sortBy as keyof BanEntry, info.sortDirection),
  }))

  loadData = () => {
    this.setState({ error: null, loading: true, started: true });

    getAllCurrentBans()
      .then(bans => this.setState({
        loading: false,
        error: null,
        listing: this.sortData(bans, this.state.sortBy, this.state.sortDirection),
      }))
      .catch(err => this.setState({
        loading: false,
        error: 'Failed to fetch list from server',
      }));
  }

  getRow = (index: Index): BanEntry => this.state.listing[index.index];

  renderTable = ({ width, height }: { width: number, height: number }) => (
    <Table
      width={width}
      height={height}
      headerHeight={50}
      rowCount={this.state.listing.length}
      rowHeight={50}
      rowGetter={this.getRow}
      sortBy={this.state.sortBy}
      sortDirection={this.state.sortDirection}
      sort={this.onSort}
    >
      <Column label="IGN" dataKey="ign" width={100} flexGrow={1} />
      <Column label="UUID" dataKey="uuid" width={150} flexGrow={1} />
      <Column label="Reason" dataKey="reason" width={200} />
      <Column label="Created" dataKey="created" width={100} />
      <Column label="Expires" dataKey="expires" width={100} />
      <Column label="Case Link" dataKey="link" width={100} />
      <Column label="Created By" dataKey="createdBy" width={100} />
    </Table>
  )

  renderCaseLink = (link: string) => {
    if (/^https?/.test(link)) {
      return (
        <a href={link} target="_blank" style={{ float: 'right' }}>
          <Tag intent={Intent.PRIMARY} className="pt-minimal">Case Link</Tag>
        </a>
      );
    }

    return <Tag intent={Intent.DANGER} className="pt-minimal" style={{ float: 'right' }}>No case link available</Tag>;
  }

  renderRow = (props: ListRowProps) => {
    const data = this.state.listing[props.index];

    return (
      <div style={props.style} key={props.key}>
        <div className="pt-card ubl-card">
          <div>
            <span style={{ fontWeight: 'bold' }} title="IGN">{data.ign}</span>
            <span style={{ float: 'right' }}>
              <span title="Created">{data.created.format('MMM Do, YYYY')}</span>
              <span> → </span>
              <span title="Expires">{data.expires.format('MMM Do, YYYY')}</span>
            </span>
          </div>
          <div>
            <small>{data.uuid}</small>
            <span style={{ float: 'right' }}>/u/{data.createdBy}</span>
          </div>
          <div>
            <em>{data.reason} - {data.expires.from(data.created, true)}</em>
            {this.renderCaseLink(data.link)}
          </div>
        </div>
      </div>
    );
  }

  renderList = ({ width, height }: { readonly width: number, readonly height: number }) => (
    <List
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

        {/*Include all state as props here so it rerenders properly whenever it changes, data not actually used*/}
        <div style={{ flex: '1 0 auto' }}>
          <AutoSizer {...this.state}>{this.renderList}</AutoSizer>
        </div>
      </div>
    );
  }
}
