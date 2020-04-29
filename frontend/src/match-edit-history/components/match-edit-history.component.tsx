import * as React from 'react';
import { Button, H1, H3, NonIdealState, Pre, Spinner } from '@blueprintjs/core';
import * as diff from 'diff';
import { connect } from 'react-redux';
import { createSelector, Selector } from 'reselect';
import { Dispatch } from 'redux';
import { aperture } from 'ramda';

import { Match } from '../../models/Match';
import { ApplicationState } from '../../state/ApplicationState';
import { getError, getIsFetching, getMatchEditHistory } from '../selectors';
import { FETCH_MATCH_EDIT_HISTORY } from '../actions';
import { MatchDetails } from '../../components/match-details';

export interface MatchEditHistoryProps {
  id: number;
}

interface StateProps {
  isFetching: boolean;
  history: Match[];
  hasError: boolean;
}

interface DispatchProps {
  fetchMatchHistory: (id: number) => void;
}

class MatchEditHistoryComponent extends React.PureComponent<MatchEditHistoryProps & StateProps & DispatchProps> {
  componentDidMount(): void {
    this.update();
  }

  componentDidUpdate(prevProps: MatchEditHistoryProps): void {
    if (prevProps.id !== this.props.id) {
      this.update();
    }
  }

  update = () => {
    this.props.fetchMatchHistory(this.props.id);
  };

  renderDiff = (a: string, b: string) => {
    const changeParts = diff.diffChars(a, b);

    return changeParts.map((change, index) => {
      let style = {};

      if (change.added) {
        style = {
          color: 'green',
          fontWeight: 'bold',
        };
      }

      if (change.removed) {
        style = {
          color: 'red',
          textDecoration: 'line-through',
        };
      }

      return (
        <span key={index} style={style}>
          {change.value}
        </span>
      );
    });
  };

  render() {
    let content;

    if (this.props.isFetching) {
      content = <Spinner />;
    } else if (this.props.hasError) {
      content = (
        <NonIdealState
          icon="error"
          title="Failed to load match edit history"
          action={<Button onClick={this.update} text="Try again" />}
        />
      );
    } else if (this.props.history.length < 2) {
      content = (
        <>
          <NonIdealState icon="warning-sign" title="No edits found for match, showing current details below" />
          <hr />
          <MatchDetails id={this.props.id} />
        </>
      );
    } else {
      const paired = aperture(2, this.props.history);

      content = paired.map(([a, b], index) => (
        <div key={`${a} -> ${b}`}>
          <H3>
            {a.id} -> {b.id}
          </H3>
          <Pre wrap="pre-wrap">{this.renderDiff(JSON.stringify(a, null, 2), JSON.stringify(b, null, 2))}</Pre>
        </div>
      ));
    }

    return (
      <div>
        <H1>Match edit history ({this.props.id})</H1>
        {content}
      </div>
    );
  }
}

const mapStateToProps: Selector<ApplicationState, StateProps> = createSelector(
  getIsFetching,
  getError,
  getMatchEditHistory,
  (isFetching, error, history) => ({
    isFetching,
    history,
    hasError: !!error,
  }),
);

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
  fetchMatchHistory: id => dispatch(FETCH_MATCH_EDIT_HISTORY.TRIGGER(id)),
});

export const MatchEditHistory: React.ComponentType<MatchEditHistoryProps> = connect(
  mapStateToProps,
  mapDispatchToProps,
)(MatchEditHistoryComponent);
