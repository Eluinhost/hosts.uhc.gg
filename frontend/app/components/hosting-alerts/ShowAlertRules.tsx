import * as React from 'react';
import { AlertRule } from '../../models/AlertRule';
import { Classes, Intent, NonIdealState, Spinner } from '@blueprintjs/core';
import { ExistingAlertRule } from './ExistingAlertRule';
import { createAlertRule, CreateAlertRulePayload, deleteAlertRule, getAllAlertRules } from '../../api';
import { createSelector } from 'reselect';
import { ApplicationState } from '../../state/ApplicationState';
import { getAccessToken } from '../../state/Selectors';
import { connect } from 'react-redux';
import { CreateAlertRule } from './CreateAlertRule';
import { AppToaster } from '../../AppToaster';

type Props = {
  readonly accessToken: string;
};

type State = {
  readonly loading: boolean;
  readonly error: string | null;
  readonly rules: AlertRule[];
};

class ShowAlertRulesComponent extends React.PureComponent<Props, State> {
  state: State = {
    loading: true,
    error: null,
    rules: [],
  };

  componentDidMount() {
    this.onRefresh();
  }

  private onRefresh = () =>
    getAllAlertRules(this.props.accessToken)
      .then((rules) => {
        this.setState({
          rules,
          loading: false,
          error: null,
        });
      })
      .catch((err) => {
        console.error(err);
        this.setState({
          loading: false,
          error: err,
        });
      })

  private onSubmit = (rule: CreateAlertRulePayload): Promise<boolean> =>
    createAlertRule(rule, this.props.accessToken)
      .then((created) => {
        AppToaster.show({
          message: 'Created new alert',
          intent: Intent.SUCCESS,
        });
        this.setState(prev => ({
          rules: [...prev.rules, created],
        }));
        
        return true;
      })
      .catch(() => {
        AppToaster.show({
          message: `Error deleting alert`,
          intent: Intent.DANGER,
        });
        
        return false;
      })

  private onDelete = (id: number) =>
    deleteAlertRule(id, this.props.accessToken)
      .then(() => {
        AppToaster.show({
          message: 'Alert deleted',
          intent: Intent.SUCCESS,
        });
        this.setState(prev => ({
          rules: prev.rules.filter(it => it.id !== id),
        }));
      })
      .catch(() => {
        AppToaster.show({
          message: `Error deleting alert`,
          intent: Intent.DANGER,
        });
      })

  render() {
    let top;
    if (this.state.error) {
      top = (
        <div className={`${Classes.CALLOUT} ${Classes.INTENT_DANGER}`}>
          <h5>Error: {this.state.error}</h5>
        </div>
      );
    } else if (this.state.loading) {
      top = <NonIdealState visual={<Spinner />} title="Loading...." />;
    } else if (this.state.rules.length === 0) {
      top = <NonIdealState visual="geosearch" title="No rules setup" />;
    } else {
      top = (
        <div>
          {this.state.rules.map(rule => <ExistingAlertRule rule={rule} key={rule.id} onClick={this.onDelete} />)}
        </div>
      );
    }

    return (
      <div>
        {top}

        <h3>Create new rule</h3>
        <CreateAlertRule onSubmit={this.onSubmit} />
      </div>
    );
  }
}

const stateSelector = createSelector<ApplicationState, string | null, Props>(
  getAccessToken,
  accessToken => ({
    accessToken: accessToken || 'NO ACCESS TOKEN IN STORE',
  }),
);

export const ShowAlertRules: React.ComponentClass = connect<Props, {}, Props>(
  stateSelector,
  () => ({}),
)(ShowAlertRulesComponent);
