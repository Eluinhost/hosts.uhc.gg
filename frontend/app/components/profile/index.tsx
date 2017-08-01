import { RouteComponentProps } from 'react-router';
import { connect } from 'react-redux';
import * as React from 'react';
import { ProfileActions, ProfileState } from '../../state/ProfileState';
import { ApplicationState } from '../../state/ApplicationState';
import { Dispatch } from 'redux';
import { Loader } from '../matches/Loader';
import { Button, Intent, NonIdealState } from '@blueprintjs/core';
import { storage } from '../../storage';

export type ProfilePageStateProps = ProfileState;
export type ProfilePageDispatchProps = {
  readonly refreshApiKey: () => Promise<void>;
  readonly regenerateApiKey: () => Promise<void>;
  readonly resetStorage: () => void;
};

class Component extends React.Component<ProfilePageStateProps & ProfilePageDispatchProps & RouteComponentProps<any>> {
  componentWillMount(): void {
    this.props.refreshApiKey();
  }

  render() {
    const { apiKey: { fetching, error, key }, refreshApiKey, regenerateApiKey, resetStorage } = this.props;

    if (fetching)
      return <Loader loading/>;

    if (error)
      return (
        <NonIdealState
          visual="warning-sign"
          title="Error"
          action={<Button onClick={refreshApiKey}>Click here to reload</Button>}
        />
      );

    return (
      <div>
        <Button onClick={refreshApiKey}>Refresh</Button>
        <Button onClick={regenerateApiKey}>Regenerate</Button>
        <pre>
          CURRENT KEY: {key ? key : 'NO API KEY GENERATED YET'}
        </pre>
        <Button intent={Intent.DANGER} onClick={resetStorage}>Reset All Data</Button>
      </div>
    );
  }
}

const mapStateToProps = (state: ApplicationState): ProfilePageStateProps => state.profile;
const mapDispatchToProps = (dispatch: Dispatch<ApplicationState>): ProfilePageDispatchProps => ({
  refreshApiKey: async (): Promise<void> => {
    await dispatch(ProfileActions.getApiKey());
  },
  regenerateApiKey: async (): Promise<void> => {
    await dispatch(ProfileActions.regenerateApiKey());
  },
  resetStorage: async (): Promise<void> => {
    await storage.clear();
    window.location.reload(true);
  },
});

export const ProfilePage: React.ComponentClass<RouteComponentProps<any>> =
  connect<ProfilePageStateProps, ProfilePageDispatchProps, RouteComponentProps<any>>(
    mapStateToProps,
    mapDispatchToProps,
  )(Component);
