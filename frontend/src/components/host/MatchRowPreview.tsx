import * as React from 'react';
import * as moment from 'moment';
import { getFormValues } from 'redux-form';
import { createSelector, Selector } from 'reselect';
import { connect } from 'react-redux';

import { CreateMatchData } from '../../models/CreateMatchData';
import { MatchRow } from '../match-row';
import { Match } from '../../models/Match';
import { ApplicationState } from '../../state/ApplicationState';
import { getUsername } from '../../state/Selectors';
import { formKey } from './formKey';

type StateProps = {
  match: Match;
};

class MatchRowPreviewComponent extends React.PureComponent<StateProps> {
  render() {
    return <MatchRow match={this.props.match} disableApproval disableLink disableRemoval />;
  }
}

const mapStateToProps: Selector<ApplicationState, StateProps> = createSelector(
  getUsername,
  getFormValues(formKey),
  (username, data: any): StateProps => {
    const formData = data as CreateMatchData;

    const preview: Match = {
      ...formData,
      id: 0,
      author: username || 'User not logged in', // shouldn't be used if there is no logged in user
      removed: false,
      removedBy: null,
      removedReason: null,
      approvedBy: null,
      created: moment.utc(),
      version: formData.version || formData.mainVersion,
    };

    return { match: preview };
  },
);

export const MatchRowPreview: React.ComponentType = connect(mapStateToProps)(MatchRowPreviewComponent);
