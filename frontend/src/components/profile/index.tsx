import { RouteComponentProps } from 'react-router';
import { connect } from 'react-redux';
import * as React from 'react';
import { ApiKeyState } from '../../state/ApiKeyState';
import { ApplicationState } from '../../state/ApplicationState';
import { Dispatch } from 'redux';
import { Button, Intent, NonIdealState, Pre, Spinner } from "@blueprintjs/core";
import { Title } from '../Title';
import { createSelector } from 'reselect';
import { ClearStorage, FetchApiKey, RegenerateApiKey } from '../../actions';

export type StateProps = {
  readonly apiKey: ApiKeyState;
};

export type DispatchProps = {
  readonly refreshApiKey: () => void;
  readonly regenerateApiKey: () => void;
  readonly resetStorage: () => void;
};

class Component extends React.PureComponent<StateProps & DispatchProps & RouteComponentProps<any>> {
  public componentDidMount(): void {
    this.props.refreshApiKey();
  }

  public render() {
    const {
      apiKey: { fetching, error, key },
      refreshApiKey,
      regenerateApiKey,
      resetStorage,
    } = this.props;

    if (fetching) {
      return <NonIdealState icon={<Spinner />} title="Loading..." />;
    }

    if (error) {
      return (
        <NonIdealState
          icon="warning-sign"
          title="Error"
          action={<Button onClick={refreshApiKey}>Click here to reload</Button>}
        />
      );
    }

    return (
      <div>
        <Title>Profile</Title>
        <Button onClick={refreshApiKey}>Refresh</Button>
        <Button onClick={regenerateApiKey}>Regenerate</Button>
        <Pre>
          <span>CURRENT KEY: </span>
          <span>{key || 'NO API KEY GENERATED YET'}</span>
        </Pre>
        <Button intent={Intent.DANGER} onClick={resetStorage}>
          Reset All Data
        </Button>
      </div>
    );
  }
}

const stateSelector = createSelector<ApplicationState, ApiKeyState, StateProps>(
  state => state.apiKey,
  apiKey => ({ apiKey }),
);

const dispatch = (dispatch: Dispatch<ApplicationState>): DispatchProps => ({
  refreshApiKey: () => dispatch(FetchApiKey.start()),
  regenerateApiKey: () => dispatch(RegenerateApiKey.start()),
  resetStorage: () => dispatch(ClearStorage.start()),
});

export const ProfilePage: React.ComponentClass<RouteComponentProps<any>> = connect<
  StateProps,
  DispatchProps,
  RouteComponentProps<any>
>(stateSelector, dispatch)(Component);
