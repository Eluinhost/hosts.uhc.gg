import * as React from 'react';
import { NonIdealState, Spinner } from '@blueprintjs/core';
import { Match } from '../../Match';
import { MatchRow } from '../match-row';
import { connect } from 'react-redux';
import { ApplicationState } from '../../state/ApplicationState';
import { always } from 'ramda';
import { HostFormConflictsState } from '../../state/HostFormConflictsState';

type StateProps = HostFormConflictsState;

class PotentialConflictsComponent extends React.PureComponent<StateProps> {
  private renderConflict = (m: Match, index: number) => (
    <MatchRow
      key={index}
      match={m}
      disableApproval
      disableRemoval
      disableLink
    />
  )

  public render() {
    const { fetching, error, conflicts } = this.props;

    if (fetching)
      return <NonIdealState visual={<Spinner />} title="Checking..." />;

    if (error)
      return <NonIdealState visual="warning-sign" title="Failed to check for potential conflicts" />;

    if (!conflicts.length)
      return <NonIdealState visual="tick" title="No conflicts found"/>;

    return (
      <div>
        {conflicts.map(this.renderConflict)}
      </div>
    );
  }
}

export const PotentialConflicts: React.ComponentClass = connect<StateProps, {}, {}>(
  (state: ApplicationState): StateProps => state.hostFormConflicts,
  always({}),
)(PotentialConflictsComponent);
