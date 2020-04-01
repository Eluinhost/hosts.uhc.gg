import * as React from 'react';
import { BanData, BanDataForm } from './BanDataForm';
import { RouteComponentProps } from 'react-router';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { getAccessToken } from '../../state/Selectors';
import { ApplicationState } from '../../state/ApplicationState';
import { always } from 'ramda';
import { UBLApi } from '../../api';
import { Title } from '../Title';
import { H1 } from '@blueprintjs/core';

type Props = {
  readonly accessToken: string | null;
};

class CreateBanPageComponent extends React.PureComponent<Props & RouteComponentProps<any>> {
  handleSubmit = (values: BanData) =>
    UBLApi.callCreateBan(values, this.props.accessToken!).then(() => {
      // if success send them to the current bans page to view it
      this.props.history.push('/ubl');
    });

  render() {
    return (
      <div>
        <Title>Create new ban</Title>
        <H1>Create new ban</H1>
        <BanDataForm submitBan={this.handleSubmit} />
      </div>
    );
  }
}

const stateSelector = createSelector<ApplicationState, string | null, Props>(getAccessToken, accessToken => ({
  accessToken,
}));

export const CreateBanPage: React.ComponentType<RouteComponentProps<any>> = connect<
  Props,
  {},
  RouteComponentProps<any>
>(
  stateSelector,
  always({}),
)(CreateBanPageComponent);
