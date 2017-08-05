import * as React from 'react';
import { HostingRulesActions } from '../../state/HostingRulesState';
import { connect, Dispatch } from 'react-redux';
import { ApplicationState } from '../../state/ApplicationState';
import { Dropdown, DropdownDispatchProps, DropdownStateProps } from './Dropdown';

export const HostingRules: React.ComponentClass = connect<DropdownStateProps, DropdownDispatchProps, {}>(
  (state: ApplicationState): DropdownStateProps => ({
    rules: state.rules,
  }),
  (dispatch: Dispatch<ApplicationState>): DropdownDispatchProps => ({
    getRules: () => dispatch(HostingRulesActions.getRules()),
    setRules: (content: string) => dispatch(HostingRulesActions.setRules(content)),
    startEdit: () => dispatch(HostingRulesActions.openEditor()),
  }),
)(Dropdown);
