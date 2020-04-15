import * as React from 'react';
import { Button, NonIdealState, Spinner } from '@blueprintjs/core';

import { SelectField, SelectFieldProps } from '../../components/fields/SelectField';
import { connect } from 'react-redux';
import { ListVersionsState } from '../reducer';
import { getListVersionsState } from '../selectors';
import { Dispatch } from 'redux';
import { FETCH_VERSIONS } from '../actions';
import { Version } from '../Version';

export type MainVersionFieldProps = Omit<SelectFieldProps, 'options'>;

type StateProps = ListVersionsState;
type DispatchProps = {
  updateVersionList: () => void;
};

class MainVersionFieldComponent extends React.PureComponent<MainVersionFieldProps & StateProps & DispatchProps> {
  componentDidMount(): void {
    if (!this.props.isFetching && !this.props.error && this.props.data.length === 0) {
      this.props.updateVersionList();
    }
  }

  render() {
    if (this.props.isFetching) {
      return <Spinner />;
    }

    if (this.props.error) {
      return (
        <NonIdealState
          icon="warning-sign"
          title="Failed to load versions list"
          action={<Button onClick={this.props.updateVersionList}>Try Again</Button>}
        />
      );
    }

    const options = this.props.data.map(item => ({
      display: item.displayName,
      value: item.displayName,
    }));

    return <SelectField {...this.props} options={options} />;
  }
}

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
  updateVersionList: () => dispatch(FETCH_VERSIONS.TRIGGER()),
});

export const MainVersionField: React.ComponentType<MainVersionFieldProps> = connect(
  getListVersionsState,
  mapDispatchToProps,
)(MainVersionFieldComponent);
