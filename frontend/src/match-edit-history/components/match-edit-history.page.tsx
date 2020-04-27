import * as React from 'react';
import { Redirect, RouteComponentProps } from 'react-router';

import { MatchEditHistory } from './match-edit-history.component';

interface Params {
  readonly id?: string;
}

export class MatchEditHistoryPage extends React.PureComponent<RouteComponentProps<Params>> {
  render() {
    if (!this.props.match.params.id) {
      return <Redirect to="/" />;
    }

    const actualId = parseInt(this.props.match.params.id, 10);

    if (isNaN(actualId)) {
      return <Redirect to="/" />;
    }

    return <MatchEditHistory id={actualId} />;
  }
}
