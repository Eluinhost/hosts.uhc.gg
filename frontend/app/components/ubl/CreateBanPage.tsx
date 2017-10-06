import * as React from 'react';
import { BanData, BanDataForm } from './BanDataForm';
import { RouteComponentProps } from 'react-router';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { getAccessToken } from '../../state/Selectors';
import { ApplicationState } from '../../state/ApplicationState';
import { always } from 'ramda';
import { createBan } from '../../api';
import { Title } from '../Title';

type Props = {
  readonly accessToken: string | null;
};

class CreateBanPageComponent extends React.PureComponent<Props & RouteComponentProps<any>> {
  handleSubmit = (values: BanData) =>
    createBan(values, this.props.accessToken!)
      .then(() => {
        // if success send them to the current bans page to view it
        this.props.history.push('/ubl');
      })

  render() {
    return (
      <div>
        <Title>Create new ban</Title>
        <h1>Create new ban</h1>
        <BanDataForm onSubmit={this.handleSubmit} />
      </div>
    );
  }
}

const stateSelector = createSelector<ApplicationState, string | null, Props>(
  getAccessToken,
  accessToken => ({ accessToken }),
);

export const CreateBanPage: React.ComponentClass<RouteComponentProps<any>> =
  connect<Props, {}, RouteComponentProps<any>>(
    stateSelector,
    always({}),
  )(CreateBanPageComponent);
