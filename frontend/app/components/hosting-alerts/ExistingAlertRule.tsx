import { AlertRule } from '../../models/AlertRule';
import { Alert, Classes, Icon, Intent, Tag } from '@blueprintjs/core';
import * as React from 'react';

type ExistingAlertRuleProps = {
  readonly rule: AlertRule;
  readonly onClick?: (id: number) => void;
};

type State = {
  readonly isHovered: boolean;
  readonly isAlertOpen: boolean;
};

export class ExistingAlertRule extends React.PureComponent<ExistingAlertRuleProps, State> {
  state = {
    isHovered: false,
    isAlertOpen: false,
  };

  private onMouseEnter = () => this.setState({ isHovered: true });
  private onMouseLeave = () => this.setState({ isHovered: false });

  private onClick = () => {
    if (this.props.onClick) {
      this.setState({ isAlertOpen: true });
    }
  }

  private onConfirm = () => {
    if (this.props.onClick) {
      this.props.onClick(this.props.rule.id);
    }
    this.onCancel();
  }

  private onCancel = () => this.setState({ isAlertOpen: false });

  public render() {
    return (
      <div className="alert-rule-set-item">
        <Tag
          className={`alert-rule-set-item__field ${Classes.LARGE} ${Classes.MINIMAL}`}
          intent={this.state.isHovered && this.props.onClick ? Intent.DANGER : Intent.NONE}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
          title={this.props.rule.field}
          onClick={this.onClick}
        >
          <Icon iconName={this.state.isHovered && this.props.onClick ? 'trash' : 'notifications'} />
          <span>{this.props.rule.field}</span>
        </Tag>

        <Tag
          className={`${Classes.LARGE} ${Classes.MINIMAL}`}
          intent={this.props.rule.exact ? Intent.SUCCESS : Intent.WARNING}
          title={this.props.rule.exact ? 'Exact Match' : 'Contains'}
        >
          {this.props.rule.exact ? '=' : '~'}
        </Tag>

        <Tag className={`${Classes.LARGE} ${Classes.MINIMAL}`}>
          {this.props.rule.alertOn}
        </Tag>

        <Alert
          isOpen={this.state.isAlertOpen}
          onConfirm={this.onConfirm}
          onCancel={this.onCancel}
          confirmButtonText="Delete"
          cancelButtonText="Cancel"
          intent={Intent.DANGER}
        >
          <p>
            Are you sure you want to delete this alert?
          </p>
        </Alert>
      </div>
    );
  }
}
