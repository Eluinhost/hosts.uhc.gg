import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { UBLApi } from '../../api';
import { any, CurriedFunction2, curry, propSatisfies } from 'ramda';
import { Intent, Tag } from '@blueprintjs/core';
import * as moment from 'moment-timezone';
import { UblListing } from './UblListing';
import { If } from '../If';
import { BanEntry } from '../../models/BanEntry';
import { Title } from '../Title';

type Params = {
  readonly uuid: string;
};

type State = {
  readonly currentlyBanned: BanState;
};

enum BanState {
  NotLoaded,
  NeverBanned,
  AllExpired,
  CurrentlyBanned,
}

const isAfter: CurriedFunction2<moment.Moment, moment.Moment, boolean> =
  curry((a: moment.Moment, b: moment.Moment) => b.isAfter(a));

export class UuidHistoryPage extends React.Component<RouteComponentProps<Params>, State> {
  state = {
    currentlyBanned: BanState.NotLoaded,
  };

  updateFlag = (bans: BanEntry[]) => {
    if (bans.length === 0) {
      this.setState({
        currentlyBanned: BanState.NeverBanned,
      });
    } else {
      this.setState({
        currentlyBanned: any(propSatisfies(isAfter(moment.utc()), 'expires'), bans)
          ? BanState.CurrentlyBanned
          : BanState.AllExpired,
      });
    }
  }

  load = () => UBLApi.fetchAllBansForUuid(this.props.match.params.uuid).then((bans) => {
    this.updateFlag(bans);
    return bans;
  })

  render() {
    return (
      <div>
        <Title>Ban History - {this.props.match.params.uuid}</Title>
        <h1>Ban History</h1>
        <small>{this.props.match.params.uuid}</small>

        <h2>
          <If condition={this.state.currentlyBanned === BanState.NotLoaded}>
            <Tag intent={Intent.PRIMARY}>Unknown ban state</Tag>
          </If>

          <If condition={this.state.currentlyBanned === BanState.NeverBanned}>
            <Tag intent={Intent.SUCCESS}>Never Banned</Tag>
          </If>

          <If condition={this.state.currentlyBanned === BanState.AllExpired}>
            <Tag intent={Intent.SUCCESS}>All Bans Expired</Tag>
          </If>

          <If condition={this.state.currentlyBanned === BanState.CurrentlyBanned}>
            <Tag intent={Intent.DANGER}>BANNED</Tag>
          </If>
        </h2>

        <UblListing refetch={this.load} onListUpdate={this.updateFlag} />
      </div>
    );
  }
}
