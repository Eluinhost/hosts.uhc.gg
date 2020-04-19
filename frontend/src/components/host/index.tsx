import * as React from 'react';
import { change, getFormValues } from 'redux-form';
import { RouteComponentProps } from 'react-router';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { createSelector, Selector } from 'reselect';

import { ApplicationState } from '../../state/ApplicationState';
import { CreateMatchForm } from './CreateMatchForm';
import { nextAvailableSlot } from './nextAvailableSlot';
import { getAccessToken, getUsername, isDarkMode, is12hFormat } from '../../state/Selectors';
import { CreateMatchData } from '../../models/CreateMatchData';
import { SetSavedHostFormData } from '../../actions';
import { createTemplateContext } from './createTemplateContext';
import { formKey } from './formKey';

type StateProps = {
  readonly formValues: CreateMatchData | undefined;
  readonly username: string;
  readonly accessToken: string;
  readonly is12h: boolean;
  readonly savedData: CreateMatchData;
};

export type DispatchProps = {
  readonly saveData: (data: Partial<CreateMatchData>) => void;
  readonly updateOpeningTime: () => void;
};

const valuesSelector: Selector<ApplicationState, CreateMatchData> = createSelector(
  getFormValues(formKey),
  data => data as CreateMatchData,
);
// Main goal of this is to save form data back to local storage when the component unmounts
class HostingPageComponent extends React.PureComponent<StateProps & DispatchProps & RouteComponentProps<any>> {
  currentFormState: Partial<CreateMatchData> = this.props.savedData || {};

  public onUnload = (): void => {
    // only save if we have values we can replace it with
    if (this.currentFormState) {
      this.props.saveData(this.currentFormState);
    }
  };

  public componentDidMount(): void {
    // when mounting we want to register for page unloads + load the stored values from local storage
    window.addEventListener('beforeunload', this.onUnload);

    // change the opening time
    this.props.updateOpeningTime();
  }

  public componentWillUnmount(): void {
    // remove the listener and fire the manual unload
    window.removeEventListener('beforeunload', this.onUnload);
    this.onUnload();
  }

  handleChange = (values: Partial<CreateMatchData>): void => {
    this.currentFormState = values;
  };

  public render() {
    // Base data, use the current form value or the stored data if it doesn't exist (first-render I think)
    const data: CreateMatchData = this.props.formValues || this.props.savedData;

    const context = createTemplateContext(data, this.props.username);

    return (
      <CreateMatchForm
        form="create-match-form"
        initialValues={this.props.savedData!}
        currentValues={data}
        templateContext={context}
        is12h={this.props.is12h}
        onChange={this.handleChange}
      />
    );
  }
}

const stateSelector: Selector<ApplicationState, StateProps> = createSelector(
  getUsername,
  valuesSelector,
  getAccessToken,
  isDarkMode,
  is12hFormat,
  state => state.hostFormSavedData,
  (username, formValues, accessToken, isDarkMode, is12h, savedData) => ({
    formValues,
    is12h,
    savedData,
    username: username || 'ERROR NO USERNAME IN STORE',
    accessToken: accessToken || 'ERROR NO ACCESS TOKEN IN STORE',
  }),
);

export const HostingPage = connect<StateProps, DispatchProps, RouteComponentProps<any>>(
  stateSelector,
  (dispatch: Dispatch): DispatchProps => ({
    saveData: (data: Partial<CreateMatchData>) => dispatch(SetSavedHostFormData.start(data)),
    updateOpeningTime: () => dispatch(change(formKey, 'opens', nextAvailableSlot())),
  }),
)(HostingPageComponent);
