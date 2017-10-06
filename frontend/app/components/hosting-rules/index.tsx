import { HostingRulesState } from '../../state/HostingRulesState';
import * as React from 'react';
import { Button, Collapse, Intent } from '@blueprintjs/core';
import { Markdown } from '../Markdown';
import { SetRulesDialog } from './SetRulesDialog';
import { WithPermission } from '../WithPermission';
import { If } from '../If';
import { connect, Dispatch } from 'react-redux';
import { GetHostingRules, SetHostingRules } from '../../actions';
import { ApplicationState } from '../../state/ApplicationState';

export type DropdownStateProps = {
  readonly rules: HostingRulesState;
};

export type DropdownDispatchProps = {
  readonly getRules: () => void;
  readonly startEdit: () => void;
};

export type DropdownState = {
  readonly areRulesOpen: boolean;
};

class Dropdown extends React.PureComponent<DropdownStateProps & DropdownDispatchProps, DropdownState> {
  state = {
    areRulesOpen: false,
  };

  iconClasses = (): string => `pt-icon-chevron-${this.state.areRulesOpen ? 'up' : 'down'}`;

  toggleDropdown = (): void => {
    if (!this.state.areRulesOpen) {
      this.props.getRules();
    }
    this.setState(prev => ({ areRulesOpen: !prev.areRulesOpen }));
  }

  stopPropagation = (e: React.MouseEvent<any>): void => e.stopPropagation();

  rulesToShow = (): string | null => {
    if (this.props.rules.data)
      return this.props.rules.data.content;

    if (this.props.rules.fetching)
      return 'Loading...';

    return this.props.rules.error;
  }

  headerInfo = (): string | null => {
    if (this.props.rules.fetching)
      return 'Loading...';

    if (this.props.rules.data) {
      const time = this.props.rules.data.modified.format('MMM Do HH:mm z');

      return `Last modified: ${time} by /u/${this.props.rules.data.author}`;
    }

    return this.props.rules.error;
  }

  render() {
    const rules = this.rulesToShow();

    return (
      <div
        className={`hosting-rules pt-callout ${this.iconClasses()}`}
        onClick={this.toggleDropdown}
      >
        <h3>Hosting Rules<small style={{ float: 'right' }}>{this.headerInfo()}</small></h3>
        <Collapse isOpen={this.state.areRulesOpen}>
          <div onClick={this.stopPropagation}>
            <WithPermission permission="hosting advisor">
              <div>
                <Button intent={Intent.PRIMARY} text="Edit Rules" onClick={this.props.startEdit} />
                <SetRulesDialog />
              </div>
            </WithPermission>
            <If condition={!!this.props.rules.error}>
              <div className="pt-callout pt-intent-danger">{this.props.rules.error}</div>
            </If>
            <If condition={!!rules}>
              <Markdown markdown={rules!} />
            </If>
          </div>
        </Collapse>
      </div>
    );
  }
}

export const HostingRules: React.ComponentClass = connect<DropdownStateProps, DropdownDispatchProps, {}>(
  (state: ApplicationState): DropdownStateProps => ({
    rules: state.rules,
  }),
  (dispatch: Dispatch<ApplicationState>): DropdownDispatchProps => ({
    getRules: () => dispatch(GetHostingRules.start()),
    startEdit: () => dispatch(SetHostingRules.openEditor()),
  }),
)(Dropdown);
