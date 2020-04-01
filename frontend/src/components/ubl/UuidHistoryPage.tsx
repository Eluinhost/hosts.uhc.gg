import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { UBLApi } from '../../api';
import { any } from 'ramda';
import { H1, H2, Intent, Tag } from '@blueprintjs/core';
import moment from 'moment-timezone';
import { UblListing } from './UblListing';
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

export class UuidHistoryPage extends React.PureComponent<RouteComponentProps<Params>, State> {
  state = {
    currentlyBanned: BanState.NotLoaded,
  };

  updateFlag = (bans: BanEntry[]) => {
    if (bans.length === 0) {
      this.setState({
        currentlyBanned: BanState.NeverBanned,
      });
    } else {
      const now = moment.utc();
      this.setState({
        currentlyBanned: any(item => !item.expires || item.expires.isAfter(now), bans)
          ? BanState.CurrentlyBanned
          : BanState.AllExpired,
      });
    }
  };

  load = () =>
    UBLApi.fetchAllBansForUuid(this.props.match.params.uuid).then(bans => {
      this.updateFlag(bans);
      return bans;
    });

  render() {
    return (
      <div>
        <Title>Ban History - {this.props.match.params.uuid}</Title>
        <H1>Ban History</H1>
        <small>{this.props.match.params.uuid}</small>

        <H2>
          {this.state.currentlyBanned === BanState.NotLoaded && <Tag intent={Intent.PRIMARY}>Unknown ban state</Tag>}

          {this.state.currentlyBanned === BanState.NeverBanned && <Tag intent={Intent.SUCCESS}>Never Banned</Tag>}

          {this.state.currentlyBanned === BanState.AllExpired && <Tag intent={Intent.SUCCESS}>All Bans Expired</Tag>}

          {this.state.currentlyBanned === BanState.CurrentlyBanned && <Tag intent={Intent.DANGER}>BANNED</Tag>}
        </H2>

        <UblListing refetch={this.load} onListUpdate={this.updateFlag} />
      </div>
    );
  }
}
