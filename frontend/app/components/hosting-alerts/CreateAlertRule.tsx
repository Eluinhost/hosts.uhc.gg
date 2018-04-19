import * as React from 'react';
import { AlertRuleField, AlertRuleFields, CreateAlertRuleData } from '../../models/AlertRule';
import { Button, Classes, Intent } from '@blueprintjs/core';

type Props = {
  readonly onSubmit: (rule: CreateAlertRuleData) => Promise<boolean>;
};

type State = {
  readonly data: CreateAlertRuleData;
  readonly validData: boolean;
};

const options: React.ReactElement<any>[] = AlertRuleFields.map(field => (
  <option key={field} value={field}>
    {field}
  </option>
));

export class CreateAlertRule extends React.PureComponent<Props, State> {
  state = {
    data: {
      field: 'content',
      exact: false,
      alertOn: '',
    } as CreateAlertRuleData,
    validData: false,
  };

  private reset = () =>
    this.setState({
      data: {
        field: 'content',
        exact: false,
        alertOn: '',
      },
      validData: false,
    });

  private onFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newField = e.target.value as AlertRuleField;

    this.setState(prev => ({
      data: {
        ...prev.data,
        field: newField,
      },
    }));
  };

  private onAlertOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    this.setState(prev => ({
      data: {
        ...prev.data,
        alertOn: newValue,
      },
      validData: newValue.trim().length > 0,
    }));
  };

  private toggleExact = (e: React.MouseEvent<HTMLButtonElement>) =>
    this.setState(prev => ({
      data: {
        ...prev.data,
        exact: !prev.data.exact,
      },
    }));

  submit = () =>
    this.props.onSubmit(this.state.data).then(reset => {
      if (reset) {
        this.reset();
      }
    });

  render() {
    const {
      data: { field, alertOn, exact },
      validData,
    } = this.state;

    return (
      <div className={`${Classes.CONTROL_GROUP} ${validData ? Classes.INTENT_SUCCESS : Classes.INTENT_DANGER}`}>
        <div className={`${Classes.SELECT}`}>
          <select value={field} onChange={this.onFieldChange}>
            {options}
          </select>
        </div>
        <Button
          onClick={this.toggleExact}
          intent={exact ? Intent.PRIMARY : Intent.WARNING}
          className={`${Classes.MINIMAL}`}
          title={exact ? 'Exact Match' : 'Contains'}
        >
          {exact ? '=' : '~'}
        </Button>
        <input className={`${Classes.INPUT} ${Classes.FILL}`} value={alertOn} onChange={this.onAlertOnChange} />
        <Button
          intent={validData ? Intent.SUCCESS : Intent.WARNING}
          disabled={!validData}
          iconName="plus"
          text="Add new Rule"
          onClick={this.submit}
        />
      </div>
    );
  }
}
