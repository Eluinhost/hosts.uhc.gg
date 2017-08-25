import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { getAllBansForUuid } from '../../api';
import { any, CurriedFunction2, curry, propSatisfies } from 'ramda';
import { Intent, Tag } from '@blueprintjs/core';
import * as moment from 'moment';
import { UblListing } from '../ubl/UblListing';
import { If } from '../If';
import { BanEntry } from '../../BanEntry';

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

export class BanHistoryPage extends React.Component<RouteComponentProps<Params>, State> {
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

  load = () => getAllBansForUuid(this.props.match.params.uuid).then((bans) => {
    this.updateFlag(bans);
    return bans;
  })

  render() {
    return (
      <div>
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
