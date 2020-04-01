import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { ShowAlertRules } from './ShowAlertRules';
import { H1 } from '@blueprintjs/core';

export class HostingAlertsPage extends React.PureComponent<RouteComponentProps<any>> {
  render() {
    return (
      <div>
        <H1>Hosting Alerts</H1>
        <div style={{ margin: 30 }}>
          <ShowAlertRules />
        </div>
      </div>
    );
  }
}
