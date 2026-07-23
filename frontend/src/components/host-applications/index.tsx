import * as React from 'react';
import { Button, Callout, H1, Intent, NonIdealState, Spinner } from '@blueprintjs/core';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { RouteComponentProps } from 'react-router';
import { createSelector } from 'reselect';
import { ApplicationState } from '../../state/ApplicationState';
import { getAccessToken, getPermissions, getUsername } from '../../state/Selectors';
import { PermissionsApi } from '../../api';
import { HostApplication } from '../../models/HostApplication';
import { ExistingHostApplication } from './ExistingHostApplication';

type StateProps = {
  readonly accessToken: string | null;
  readonly username: string | null;
  readonly permissions: string[];
};

type State = {
  readonly applications: HostApplication[];
  readonly loading: boolean;
  readonly error: string | null;
};

class HostApplicationsPageComponent extends React.PureComponent<StateProps & RouteComponentProps<any>, State> {
  state: State = {
    applications: [],
    loading: true,
    error: null,
  };

  public componentDidMount() {
    this.loadApplications();
  }

  private canApply = () =>
    !!this.props.username && !this.props.permissions.includes('host') && !this.props.permissions.includes('trial host') && !this.props.permissions.includes('hosting banned');

  private isBanned = () => this.props.permissions.includes('hosting banned');

  private canReview = () => this.props.permissions.includes('hosting advisor');

  private sortedApplications = (): HostApplication[] => {
    const { username } = this.props;
    if (!username) return this.state.applications;

    const mine = this.state.applications.filter(application => application.username === username);
    const others = this.state.applications.filter(application => application.username !== username);
    return [...mine, ...others];
  };

  private loadApplications = async () => {
    try {
      const applications = await PermissionsApi.fetchHostApplications();
      this.setState({ applications, loading: false, error: null });
    } catch (error) {
      this.setState({ loading: false, error: 'Unable to load host applications' });
    }
  };

  public render() {
    const canApply = this.canApply();
    const canReview = this.canReview();

    return (
      <div>
        <H1>Host Applications</H1>

        {this.state.error && <Callout intent={Intent.DANGER}>{this.state.error}</Callout>}

        {this.isBanned() && (
          <Callout intent={Intent.DANGER} style={{ marginBottom: 20 }}>
            You are banned from hosting and cannot submit an application.
          </Callout>
        )}

        {canApply && (
          <div style={{ marginBottom: 20 }}>
            <Link to="/host-applications/apply">
              <Button intent={Intent.PRIMARY} icon="add">
                Apply to host
              </Button>
            </Link>
          </div>
        )}

        {this.state.loading ? (
          <Spinner />
        ) : this.state.applications.length === 0 ? (
          <NonIdealState icon="inbox" title="No host applications yet" description="There are no host applications to see yet." />
        ) : (
          this.sortedApplications().map(application => (
            <ExistingHostApplication
              application={application}
              key={application.id}
              canReview={canReview}
              isOwn={application.username === this.props.username}
              accessToken={this.props.accessToken || ''}
              onReviewed={this.loadApplications}
            />
          ))
        )}
      </div>
    );
  }
}

const stateSelector = createSelector<ApplicationState, string | null, string | null, string[], StateProps>(
  getAccessToken,
  getUsername,
  getPermissions,
  (accessToken, username, permissions) => ({ accessToken, username, permissions }),
);

export const HostApplicationsPage: React.ComponentType<RouteComponentProps<any>> = connect<StateProps, {}, RouteComponentProps<any>>(
  stateSelector,
)(HostApplicationsPageComponent);