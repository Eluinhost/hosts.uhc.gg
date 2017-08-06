import { HostFormConflicts } from '../../state/HostFormState';
import * as React from 'react';
import { NonIdealState, Spinner } from '@blueprintjs/core';
import { map } from 'ramda';
import { Match } from '../../Match';
import { MatchRow } from '../matches/MatchRow';
import { connect } from 'react-redux';
import { ApplicationState } from '../../state/ApplicationState';

type ComponentStateProps = HostFormConflicts;

const noop = () => undefined;
const renderConflict = (m: Match) => (
  <MatchRow
    match={m}
    canRemove={false}
    onRemovePress={noop}
    onApprovePress={noop}
  />
);

const Component: React.SFC<ComponentStateProps> = ({ data, error, fetching }) => {
  if (fetching)
    return <NonIdealState visual={<Spinner />} title="Checking..." />;

  if (error)
    return <NonIdealState visual="warning-sign" title="Failed to check for potentical conflicts" />;

  if (!data.length)
    return <NonIdealState visual="tick" title="No conflicts found"/>;
    
  return (
    <div>
      {map(renderConflict, data)}
    </div>
  );
};

export const PotentialConflicts: React.ComponentClass = connect<ComponentStateProps, {}, {}>(
  (state: ApplicationState): ComponentStateProps => state.hostForm.conflicts,
)(Component);
