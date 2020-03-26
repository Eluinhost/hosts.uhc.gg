import * as React from 'react';
import * as moment from 'moment';
import * as momentTz from 'moment-timezone';
import { Classes, Icon, Intent, Button } from '@blueprintjs/core';
import { createSelector } from 'reselect';
import { ApplicationState } from '../../state/ApplicationState';
import * as Selectors from '../../state/Selectors';
import { connect } from 'react-redux';

type OwnProps = {
  readonly lastUpdated: moment.Moment | null;
  readonly onClick: () => void;
  readonly loading: boolean;
};

type StateProps = {
  readonly format: string;
  readonly timezone: string;
};

export class RefreshButtonComponent extends React.PureComponent<OwnProps & StateProps> {
  public render() {
    let buttonContent: string;

    if (this.props.loading) {
      buttonContent = 'Refreshing...';
    } else if (this.props.lastUpdated) {
      buttonContent = `Refreshed @ ${(this.props.lastUpdated
        .clone() as momentTz.Moment)
        .tz(this.props.timezone)
        .format(this.props.format)}`;
    } else {
      buttonContent = `Refresh`;
    }

    return (
      <Button
        intent={Intent.SUCCESS}
        minimal
        large
        onClick={this.props.onClick}
        disabled={this.props.loading}
        icon={<Icon icon="refresh" className={this.props.loading ? Classes.SPINNER_ANIMATION : ''}/>}
        text={buttonContent}
      />
    );
  }
}

const stateSelector = createSelector<ApplicationState, string, string, StateProps>(
  Selectors.getTimeFormat,
  Selectors.getTimezone,
  (format, timezone) => ({ format, timezone }),
);

export const RefreshButton: React.ComponentClass<OwnProps> = connect<StateProps, {}, OwnProps>(
  stateSelector,
  () => ({}),
)(RefreshButtonComponent);