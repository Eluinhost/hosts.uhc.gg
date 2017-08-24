import * as React from 'react';
import { BanEntry } from '../../BanEntry';
import { RouteComponentProps } from 'react-router';
import { getAllBansForUuid } from '../../api';
import { map, any, CurriedFunction2, curry, propSatisfies, filter, complement, when, propEq, always } from 'ramda';
import { Intent, NonIdealState, Tag } from '@blueprintjs/core';
import * as moment from 'moment';
import { UblEntryRow } from '../ubl/UblEntryRow';

type State = {
  readonly bans: BanEntry[];
  readonly error: string | null;
  readonly loading: boolean;
};

type Params = {
  readonly uuid: string;
};

const isAfter: CurriedFunction2<moment.Moment, moment.Moment, boolean> =
  curry((a: moment.Moment, b: moment.Moment) => b.isAfter(a));

export class BanHistoryPage extends React.Component<RouteComponentProps<Params>, State> {
  state = {
    bans: [],
    error: null,
    loading: true,
  };

  componentDidMount() {
    this.load();
  }

  load = async ()  => {
    this.setState({
      loading: true,
      error: null,
    });

    try {
      const bans = await getAllBansForUuid(this.props.match.params.uuid);

      this.setState({
        bans,
        error: null,
        loading: false,
      });
    } catch (err) {
      this.setState({
        error: 'Unable to fetch list from server',
        loading: false,
      });
    }
  }

  onRowDeleted = (id: number) => this.setState(prev => ({
    bans: filter(complement(propEq('id', id)), prev.bans),
  }))

  onRowEdited = (ban: BanEntry, oldBan: BanEntry) => this.setState(prev => ({
    bans: map(when(propEq('id', oldBan.id), always(ban)), prev.bans),
  }))

  renderBans: (bans: BanEntry[]) => React.ReactElement<any>[] =
    map<BanEntry, React.ReactElement<any>>(ban => (
      <UblEntryRow
        key={ban.id}
        ban={ban}
        onDeleted={this.onRowDeleted}
        onEdited={this.onRowEdited}
      />
    ));

  renderList = (): React.ReactElement<any> | React.ReactElement<any>[] => {
    if (this.state.bans.length)
      return this.renderBans(this.state.bans);
    else
      return <NonIdealState title="No bans found for UUID" visual="geosearch" />;
  }

  render() {
    const isBanned = any(
      propSatisfies(isAfter(moment.utc()), 'expires'),
      this.state.bans,
    );

    return (
      <div>
        <h1>Ban History</h1>
        <small>{this.props.match.params.uuid}</small>

        <h2>
          <Tag
            intent={isBanned ? Intent.DANGER : Intent.SUCCESS}
          >
            {isBanned ? 'BANNED' : (this.state.bans.length ? 'All Bans Expired' : 'Not Banned')}
          </Tag>
        </h2>

        {this.renderList()}
      </div>
    );
  }
}
