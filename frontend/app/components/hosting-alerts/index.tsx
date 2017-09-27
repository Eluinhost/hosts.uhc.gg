import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { ShowAlertRules } from './ShowAlertRules';

export class HostingAlertsPage extends React.PureComponent<RouteComponentProps<any>> {
  render() {
    return (
      <div>
        <h1>Hosting Alerts</h1>
        <div style={{ margin: 30 }}>
          <ShowAlertRules />
        </div>
      </div>
    );
  }
}
