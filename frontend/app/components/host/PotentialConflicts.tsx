import { HostFormConflicts } from '../../state/HostFormState';
import * as React from 'react';
import { NonIdealState, Spinner } from '@blueprintjs/core';
import { map, addIndex } from 'ramda';
import { Match } from '../../Match';
import { MatchRow } from '../matches/MatchRow';
import { connect } from 'react-redux';
import { ApplicationState } from '../../state/ApplicationState';

type ComponentStateProps = HostFormConflicts & {
  readonly isDarkMode: boolean;
};

const noop = () => undefined;
const renderConflict = (isDarkMode: boolean) => (m: Match, index: number) => (
  <MatchRow
    key={index}
    match={m}
    canApprove={false}
    canRemove={false}
    onRemovePress={noop}
    onApprovePress={noop}
    isDarkMode={isDarkMode}
  />
);

const Component: React.SFC<ComponentStateProps> = ({ data, error, fetching, isDarkMode }) => {
  if (fetching)
    return <NonIdealState visual={<Spinner />} title="Checking..." />;

  if (error)
    return <NonIdealState visual="warning-sign" title="Failed to check for potential conflicts" />;

  if (!data.length)
    return <NonIdealState visual="tick" title="No conflicts found"/>;
    
  return (
    <div>
      {addIndex(map)(renderConflict(isDarkMode), data)}
    </div>
  );
};

export const PotentialConflicts: React.ComponentClass = connect<ComponentStateProps, {}, {}>(
  (state: ApplicationState): ComponentStateProps => ({
    ...state.hostForm.conflicts,
    isDarkMode: state.settings.isDarkMode,
  }),
)(Component);
