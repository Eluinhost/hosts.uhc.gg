import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { parse } from 'query-string';

import { ApprovalModal } from '../approval-modal';
import { RemovalModal } from '../removal-modal';
import { MatchDetails } from '../match-details';

type Params = {
  readonly id?: string;
};

export class MatchDetailsPage extends React.PureComponent<RouteComponentProps<Params>> {
  public render() {
    const redirect: boolean = !parse(this.props.location.search).ignoreRedirect;

    return (
      <div>
        <MatchDetails id={Number(this.props.match.params.id)} followEditRedirects={redirect} />
        <ApprovalModal />
        <RemovalModal />
      </div>
    );
  }
}
