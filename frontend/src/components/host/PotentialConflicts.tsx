import * as React from 'react';
import { NonIdealState, Spinner } from '@blueprintjs/core';
import { connect } from 'react-redux';

import { Match } from '../../models/Match';
import { MatchRow } from '../match-row';
import { HostFormConflictsState } from '../../state/HostFormConflictsState';

type StateProps = HostFormConflictsState;

class PotentialConflictsComponent extends React.PureComponent<StateProps> {
  private renderConflict = (m: Match, index: number) => (
    <MatchRow key={index} match={m} disableApproval disableRemoval disableLink />
  );

  public render() {
    const { fetching, error, conflicts } = this.props;

    if (fetching) return <NonIdealState icon={<Spinner />} title="Checking..." />;

    if (error) return <NonIdealState icon="warning-sign" title="Failed to check for potential conflicts" />;

    if (!conflicts.length) return <NonIdealState icon="tick" title="No conflicts found" />;

    return <div>{conflicts.map(this.renderConflict)}</div>;
  }
}

export const PotentialConflicts: React.ComponentType = connect<StateProps>(state => state.hostFormConflicts)(
  PotentialConflictsComponent,
);
