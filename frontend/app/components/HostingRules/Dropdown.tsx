import { HostingRules, HostingRulesState } from '../../state/HostingRulesState';
import * as React from 'react';
import { Button, Collapse, Intent } from '@blueprintjs/core';
import { Markdown } from '../Markdown';
import { SetRulesDialog } from './SetRulesDialog';
import { WithPermission } from '../WithPermission';

export type DropdownStateProps = {
  readonly rules: HostingRulesState;
};

export type DropdownDispatchProps = {
  readonly getRules: () => Promise<HostingRules>;
  readonly setRules: (content: string) => Promise<void>;
  readonly startEdit: () => void;
};

export type DropdownState = {
  readonly areRulesOpen: boolean;
};

export class Dropdown extends React.Component<DropdownStateProps & DropdownDispatchProps, DropdownState> {
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
        className={`hosting-rules pt-intent-warning pt-callout ${this.iconClasses()}`}
        onClick={this.toggleDropdown}
      >
        <h3>Hosting Rules<small style={{ float: 'right' }}>{this.headerInfo()}</small></h3>
        <Collapse isOpen={this.state.areRulesOpen}>
          <div onClick={this.stopPropagation}>
            <WithPermission permission="moderator">
              <div>
                <Button intent={Intent.WARNING} text="Edit Rules" onClick={this.props.startEdit} />
                <SetRulesDialog />
              </div>
            </WithPermission>
            {this.props.rules.error && <div className="pt-callout pt-intent-danger">{this.props.rules.error}</div>}
            {rules && <Markdown markdown={rules} />}
          </div>
        </Collapse>
      </div>
    );
  }
}
