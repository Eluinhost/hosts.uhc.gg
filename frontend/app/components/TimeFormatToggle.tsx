import * as React from 'react';
import { createSelector } from 'reselect';
import { ApplicationState } from '../state/ApplicationState';
import { connect } from 'react-redux';
import { SettingsActions } from '../state/SettingsState';

type StateProps = {
  readonly is12h: boolean;
};

type DispatchProps = {
  readonly toggle: () => void;
};

const TimeFormatToggleComponent: React.SFC<StateProps & DispatchProps> = ({ is12h, toggle }) => (
  <label className="pt-control pt-switch">
    <input type="checkbox" checked={is12h} onChange={toggle} />
    <span className="pt-control-indicator" />
    {is12h ? '12h' : '24h'}
  </label>
);

const stateSelector = createSelector<ApplicationState, boolean, StateProps>(
  state => state.settings.is12h,
  is12h => ({
    is12h,
  }),
);

export const TimeFormatToggle: React.ComponentClass = connect<StateProps, DispatchProps, {}>(
  stateSelector,
  dispatch => ({
    toggle: () => dispatch(SettingsActions.toggle12hFormat()),
  }),
)(TimeFormatToggleComponent);
