import * as React from 'react';
import { BanEntry } from '../../BanEntry';
import { RouteComponentProps } from 'react-router';
import { getAllBansForUuid } from '../../api';
import { map } from 'ramda';
import { BanHistoryEntry } from './BanHistoryEntry';
import { NonIdealState } from '@blueprintjs/core';

type State = {
  readonly bans: BanEntry[];
  readonly error: string | null;
  readonly loading: boolean;
};

type Params = {
  readonly uuid: string;
};

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

  renderBans: (bans: BanEntry[]) => React.ReactElement<any>[] =
    map<BanEntry, React.ReactElement<any>>(ban => <BanHistoryEntry {...ban} key={ban.id} />);

  renderList = (): React.ReactElement<any> | React.ReactElement<any>[] => {
    if (this.state.bans.length)
      return this.renderBans(this.state.bans);
    else
      return <NonIdealState title="No bans found for UUID" visual="geosearch" />;
  }

  render() {
    return (
      <div>
        <h1>Ban history for {this.props.match.params.uuid}</h1>

        {this.renderList()}
      </div>
    );
  }
}
