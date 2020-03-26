import { HostingRulesState } from '../../state/HostingRulesState';
import * as React from 'react';
import { Button, Callout, Collapse, H3, Intent } from "@blueprintjs/core";
import { Markdown } from '../Markdown';
import { SetRulesDialog } from './SetRulesDialog';
import { WithPermission } from '../WithPermission';
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

  toggleDropdown = (): void => {
    if (!this.state.areRulesOpen) {
      this.props.getRules();
    }
    this.setState(prev => ({ areRulesOpen: !prev.areRulesOpen }));
  };

  stopPropagation = (e: React.MouseEvent<any>): void => e.stopPropagation();

  rulesToShow = (): string | null => {
    if (this.props.rules.data) return this.props.rules.data.content;

    if (this.props.rules.fetching) return 'Loading...';

    return this.props.rules.error;
  };

  headerInfo = (): string | null => {
    if (this.props.rules.fetching) return 'Loading...';

    if (this.props.rules.data) {
      const time = this.props.rules.data.modified.format('MMM Do HH:mm z');

      return `Last modified: ${time} by /u/${this.props.rules.data.author}`;
    }

    return this.props.rules.error;
  };

  render() {
    const rules = this.rulesToShow();

    return (
      <Callout icon={this.state.areRulesOpen ? 'chevron-up' : 'chevron-down'} className="hosting-rules" onClick={this.toggleDropdown}>
        <H3>
          Hosting Rules<small style={{ float: 'right' }}>{this.headerInfo()}</small>
        </H3>
        <Collapse isOpen={this.state.areRulesOpen}>
          <div onClick={this.stopPropagation}>
            <WithPermission permission="hosting advisor">
              <div>
                <Button intent={Intent.PRIMARY} text="Edit Rules" onClick={this.props.startEdit} />
                <SetRulesDialog />
              </div>
            </WithPermission>
            {!!this.props.rules.error && <Callout intent={Intent.DANGER}>{this.props.rules.error}</Callout>}
            {!!rules && <Markdown markdown={rules!} />}
          </div>
        </Collapse>
      </Callout>
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
