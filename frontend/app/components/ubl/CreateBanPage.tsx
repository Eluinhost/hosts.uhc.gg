import * as React from 'react';
import { CreateBanForm } from './CreateBanForm';
import { RouteComponentProps } from 'react-router';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { getAccessToken } from '../../state/Selectors';
import { ApplicationState } from '../../state/ApplicationState';
import { always } from 'ramda';

type Props = {
  readonly accessToken: string | null;
};

const CreateBanPageComponent: React.SFC<Props & RouteComponentProps<any>> = ({ accessToken, history }) => (
  <div>
    <h1>Create new ban</h1>
    <CreateBanForm accessToken={accessToken!} history={history} />
  </div>
);

const stateSelector = createSelector<ApplicationState, string | null, Props>(
  getAccessToken,
  accessToken => ({ accessToken }),
);

export const CreateBanPage: React.ComponentClass<RouteComponentProps<any>> =
  connect<Props, {}, RouteComponentProps<any>>(
    stateSelector,
    always({}),
  )(CreateBanPageComponent);
