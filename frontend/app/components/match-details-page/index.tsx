import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { ApprovalModal } from '../approval-modal';
import { RemovalModal } from '../removal-modal';
import { MatchDetails } from '../match-details';

type Params = {
  readonly id: number;
};

export class MatchDetailsPage extends React.PureComponent<RouteComponentProps<Params>> {
  public render() {
    return (
      <div>
        <MatchDetails id={Number(this.props.match.params.id)} />
        <ApprovalModal />
        <RemovalModal />
      </div>
    );
  }
}
