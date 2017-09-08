import { MatchDetails } from './MatchDetails';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';

type Params = {
  readonly id: number;
};

export const MatchDetailsPage: React.SFC<RouteComponentProps<Params>> = ({ match }) => (
  <div>
    <MatchDetails matchId={Number(match.params.id)} />
  </div>
);
