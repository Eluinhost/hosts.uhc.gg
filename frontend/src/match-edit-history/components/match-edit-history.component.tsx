import * as React from 'react';
import { Button, Card, Elevation, H1, H2, H4, H5, NonIdealState, Pre, Spinner } from '@blueprintjs/core';
import * as diff from 'diff';
import { connect } from 'react-redux';
import { createSelector, Selector } from 'reselect';
import { Dispatch } from 'redux';
import { aperture, keys, union } from 'ramda';
import { Link } from 'react-router-dom';

import { Match } from '../../models/Match';
import { ApplicationState } from '../../state/ApplicationState';
import { getError, getIsFetching, getMatchEditHistory } from '../selectors';
import { FETCH_MATCH_EDIT_HISTORY } from '../actions';
import { MatchDetails } from '../../components/match-details';

import './match-edit-history.component.scss';

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

  extractInteresetingFields = (match: Match) => {
    const {
      author,
      removed,
      removedBy,
      removedReason,
      approvedBy,
      originalEditId,
      latestEditId,
      ...intereseting
    } = match;

    return intereseting;
  };

  renderDiff = (now: string = '', previous: string = '') => {
    const changeParts = diff.diffChars(previous, now);

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

  renderKeyDifferences = (now: object, previous: object): React.ReactNode => {
    const allKeys = union(keys(now), keys(previous));

    return allKeys
      .map(key => [key, JSON.stringify(now[key], null, 2), JSON.stringify(previous[key], null, 2)])
      .filter(([key, now, previous]) => now !== previous)
      .map(([key, now, previous]) => (
        <div key={key}>
          <H4>{key}:</H4>
          <Pre wrap="pre-wrap">{this.renderDiff(now, previous)}</Pre>
        </div>
      ));
  };

  renderAllChanges = (): React.ReactNode => {
    const paired = aperture(2, this.props.history.map(this.extractInteresetingFields));

    return paired.map(
      (
        [
          { id: nowId, created: nowCreated, ...nowFields },
          { id: previousId, created: previousCreated, ...previousFields },
        ],
        index,
      ) => (
        <Card
          className="edit-history-card"
          elevation={nowId === this.props.id ? Elevation.FOUR : Elevation.ZERO}
          key={`${previousId} -> ${nowId}`}
          style={{ marginBottom: '1rem' }}
        >
          <div className="edit-history-card__header">
            <H2>Edit #{paired.length - index}</H2>
            <div>
              <H5>
                {this.renderLinkForId(previousId)} -> {this.renderLinkForId(nowId)}
              </H5>
              <H5>{previousCreated.toISOString()} UTC</H5>
            </div>
          </div>
          {this.renderKeyDifferences(nowFields, previousFields)}
        </Card>
      ),
    );
  };

  renderLinkForId = (id: number) => <Link to={`/m/${id}?ignoreRedirect=1`}>{id}</Link>;

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
          <MatchDetails id={this.props.id} followEditRedirects={false} />
        </>
      );
    } else {
      content = this.renderAllChanges();
    }

    return (
      <div>
        <H1>Match edit history for match {this.renderLinkForId(this.props.id)}.</H1>
        {this.props.history.length && (
          <div>
            <H2>Latest version: {this.renderLinkForId(this.props.history[0].id)}</H2>
            <H2>Original version: {this.renderLinkForId(this.props.history[this.props.history.length - 1].id)}</H2>
          </div>
        )}
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
    history: history.reverse(),
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
