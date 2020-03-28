import * as React from 'react';
import { AlertRule, CreateAlertRuleData } from '../../models/AlertRule';
import { Classes, H3, H5, Intent, NonIdealState, Spinner } from "@blueprintjs/core";
import { ExistingAlertRule } from './ExistingAlertRule';
import { AlertsApi } from '../../api';
import { createSelector } from 'reselect';
import { ApplicationState } from '../../state/ApplicationState';
import { getAccessToken } from '../../state/Selectors';
import { connect } from 'react-redux';
import { CreateAlertRule } from './CreateAlertRule';
import { AppToaster } from '../../services/AppToaster';
import { ComponentType } from "react";

type DispatchProps = {
  readonly accessToken: string;
};

type State = {
  readonly loading: boolean;
  readonly error: string | null;
  readonly rules: AlertRule[];
};

class ShowAlertRulesComponent extends React.PureComponent<DispatchProps, State> {
  state: State = {
    loading: true,
    error: null,
    rules: [],
  };

  componentDidMount() {
    this.onRefresh();
  }

  private onRefresh = () =>
    AlertsApi.fetchAllAlertRules(this.props.accessToken)
      .then(rules => {
        this.setState({
          rules,
          loading: false,
          error: null,
        });
      })
      .catch(err => {
        console.error(err);
        this.setState({
          loading: false,
          error: err,
        });
      });

  private onSubmit = (rule: CreateAlertRuleData): Promise<boolean> =>
    AlertsApi.callCreateAlertRule(rule, this.props.accessToken)
      .then(created => {
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
      });

  private onDelete = (id: number) =>
    AlertsApi.callDeleteAlertRule(id, this.props.accessToken)
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
      });

  render() {
    let top;
    if (this.state.error) {
      top = (
        <div className={`${Classes.CALLOUT} ${Classes.INTENT_DANGER}`}>
          <H5>Error: {this.state.error}</H5>
        </div>
      );
    } else if (this.state.loading) {
      top = <NonIdealState icon={<Spinner />} title="Loading...." />;
    } else if (this.state.rules.length === 0) {
      top = <NonIdealState icon="geosearch" title="No rules setup" />;
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

        <H3>Create new rule</H3>
        <CreateAlertRule onSubmit={this.onSubmit} />
      </div>
    );
  }
}

const stateSelector = createSelector<ApplicationState, string | null, DispatchProps>(
  getAccessToken,
  accessToken => ({
      accessToken: accessToken || 'NO ACCESS TOKEN IN STORE',
  }));

export const ShowAlertRules: ComponentType = connect<DispatchProps, {}, {}>(stateSelector)(ShowAlertRulesComponent);
