import { AlertRule } from '../../models/AlertRule';
import { Classes, Icon, Intent, Tag } from '@blueprintjs/core';
import * as React from 'react';

type ExistingAlertRuleProps = {
  readonly rule: AlertRule;
  readonly onClick?: (id: number) => void;
};

export class ExistingAlertRule extends React.PureComponent<ExistingAlertRuleProps, { readonly hover: boolean }> {
  state = {
    hover: false,
  };

  private onMouseEnter = () => this.setState({ hover: true });
  private onMouseLeave = () => this.setState({ hover: false });
  private onClick = () => {
    if (this.props.onClick) {
      this.props.onClick(this.props.rule.id);
    }
  }

  public render() {
    return (
      <div className="alert-rule-set-item">
        <Tag
          className={`alert-rule-set-item__field ${Classes.LARGE} ${Classes.MINIMAL}`}
          intent={this.state.hover ? Intent.DANGER : Intent.NONE}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
          title={this.props.rule.field}
          onClick={this.onClick}
        >
          <Icon iconName={this.state.hover ? 'trash' : 'notifications'} />
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
      </div>
    );
  }
}
