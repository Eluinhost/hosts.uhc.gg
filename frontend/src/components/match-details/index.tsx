import * as React from 'react';
import { Classes, Icon, Intent, NonIdealState, Spinner, Tag, Button, H2, H4, H5, Callout } from '@blueprintjs/core';
import { Redirect } from 'react-router';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { createSelector } from 'reselect';

import { UsernameLink } from '../UsernameLink';
import { TeamStyle } from '../team-style';
import { ClipboardControlGroup } from '../clipboard-control-group';
import { Markdown } from '../Markdown';
import { TimeFromNowTag } from '../time/TimeFromNowTag';
import { MatchOpens } from '../time/MatchOpens';
import { MatchDetailsState } from '../../state/MatchDetailsState';
import { ApplicationState } from '../../state/ApplicationState';
import { ApproveMatch, FetchMatchDetails, RemoveMatch } from '../../actions';
import { getUsername, matchesPermissions } from '../../state/Selectors';

type StateProps = {
  readonly details: MatchDetailsState;
  readonly canApprove: boolean;
  readonly canRemove: boolean;
};

type DispatchProps = {
  readonly clear: () => void;
  readonly load: (id: number) => void;
  readonly approve: () => void;
  readonly remove: () => void;
};

type OwnProps = {
  readonly id: number;
  readonly followEditRedirects: boolean;
};

class MatchDetailsComponent extends React.PureComponent<StateProps & DispatchProps & OwnProps> {
  public componentDidMount() {
    this.props.clear();
    this.props.load(this.props.id);
  }

  public componentDidUpdate(prev: StateProps & DispatchProps & OwnProps) {
    if (this.props.id !== prev.id) {
      this.props.clear();
      this.props.load(this.props.id);
    }
  }

  public componentWillUnmount() {
    this.props.clear();
  }

  private renderTags = (tags: string[]): React.ReactElement<any>[] =>
    tags.map((tag, index) => (
      <Tag intent={Intent.PRIMARY} className={`${Classes.LARGE}`} title="Tag" key={index}>
        <Icon icon="tag" /> {tag}
      </Tag>
    ));

  private renderScenarios = (scenarios: string[]): React.ReactElement<any>[] =>
    scenarios.map((scenario, index) => (
      <Tag intent={Intent.NONE} className={`${Classes.LARGE}`} title="Scenario" key={index}>
        {scenario}
      </Tag>
    ));

  public render() {
    if (this.props.details.fetching) return <Spinner />;

    if (this.props.details.error) return <NonIdealState icon="warning-sign" title="Error loading data" />;

    if (this.props.details.match == null) return <NonIdealState icon="geosearch" title="Not found" />;

    const {
      opens,
      region,
      location,
      hostingName,
      author,
      count,
      tags,
      pvpEnabledAt,
      mapSize,
      slots,
      removed,
      size,
      teams,
      customStyle,
      tournament,
      scenarios,
      ip,
      address,
      content,
      length,
      version,
      removedBy,
      removedReason,
      approvedBy,
      mainVersion,
      latestEditId,
    } = this.props.details.match;

    const { canApprove, canRemove, approve, remove, followEditRedirects } = this.props;

    if (followEditRedirects && latestEditId) {
      return <Redirect to={`/m/${latestEditId}`} />;
    }

    return (
      <>
        {latestEditId && (
          <Callout intent={Intent.WARNING} style={{ marginBottom: '2rem' }}>
            <Link to={`/m/${latestEditId}`}>
              This is not the latest version of this match, click this to view the latest version
            </Link>
            <span> OR </span>
            <Link to={`/m/${latestEditId}/history`}>click here to view edit history</Link>
          </Callout>
        )}
        <div className={`${Classes.CARD} match-details`}>
          <div className="match-details__header">
            <div className="match-details__header__floating-tags__top">
              <TimeFromNowTag time={opens} className={`${Classes.LARGE}`} title="Opens" />
              <Tag intent={Intent.SUCCESS} title="Region - Location" className={`${Classes.LARGE}`}>
                <Icon icon="globe" /> {region} - {location}
              </Tag>
              {tournament && (
                <Tag intent={Intent.PRIMARY} className={`${Classes.LARGE}`}>
                  <Icon icon="timeline-bar-chart" /> Tournament
                </Tag>
              )}
              {removed && (
                <Tag intent={Intent.DANGER} className={`${Classes.LARGE}`}>
                  <Icon icon="warning-sign" /> REMOVED
                </Tag>
              )}
            </div>

            <div className="match-details__header__content">
              <H2>
                {hostingName || author}'s #{count}
              </H2>
              <H4>
                <MatchOpens time={opens} />
              </H4>
              <UsernameLink username={author} />
            </div>

            <div className="match-details__header__floating-tags__bottom">
              <div>
                <Tag intent={Intent.DANGER} title="Team style" className={`${Classes.LARGE}`}>
                  <Icon icon="people" /> <TeamStyle size={size} style={teams} custom={customStyle} />
                </Tag>
                <Tag intent={Intent.PRIMARY} title={`Server version: ${mainVersion}`} large>
                  <Icon icon="cube" /> {version}
                </Tag>
                {this.renderTags(tags)}
              </div>
              <div className="match-details__scenarios">{this.renderScenarios(scenarios)}</div>
            </div>
          </div>
          <div className="match-details__server-address">
            {!!ip && <ClipboardControlGroup value={ip!} />}

            {!!address && <ClipboardControlGroup value={address!} />}
          </div>
          <div className="match-details__extra-info">
            <label className={`${Classes.LABEL}`}>
              PVP @
              <input
                className={`${Classes.INPUT} ${Classes.FILL}`}
                type="text"
                value={`${pvpEnabledAt} minutes`}
                readOnly
              />
            </label>

            <label className={`${Classes.LABEL}`}>
              Meetup @
              <input className={`${Classes.INPUT} ${Classes.FILL}`} type="text" value={`${length} minutes`} readOnly />
            </label>

            <label className={`${Classes.LABEL}`}>
              Map
              <input
                className={`${Classes.INPUT} ${Classes.FILL}`}
                type="text"
                value={`${mapSize} x ${mapSize}`}
                readOnly
              />
            </label>
            <label className={`${Classes.LABEL}`}>
              Slots
              <input className={`${Classes.INPUT} ${Classes.FILL}`} type="text" value={`${slots} slots`} readOnly />
            </label>
          </div>
          <div className="match-details__content">
            {removed && (
              <div className={`${Classes.CALLOUT} ${Classes.INTENT_DANGER}`}>
                <H5>
                  <Icon icon="warning-sign" /> REMOVED
                </H5>
                <p>This game is no longer on the calendar:</p>
                <p>
                  {removedReason} - /u/{removedBy}
                </p>
              </div>
            )}

            {!removed && !!approvedBy && (
              <div className={`${Classes.CALLOUT} ${Classes.INTENT_SUCCESS}`}>
                <H5>
                  <Icon icon="tick" /> Approved by /u/{approvedBy}
                </H5>
              </div>
            )}

            {(canApprove || canRemove) && (
              <div className={`${Classes.BUTTON_GROUP} ${Classes.MINIMAL} ${Classes.LARGE}`}>
                {canApprove && (
                  <Button intent={Intent.SUCCESS} icon="confirm" title="Approve Match" onClick={approve} />
                )}
                {canRemove && <Button intent={Intent.DANGER} icon="trash" onClick={remove} title="Remove" />}
              </div>
            )}
            <Markdown markdown={content} />
          </div>
        </div>
      </>
    );
  }
}

const stateSelector = createSelector<ApplicationState, MatchDetailsState, boolean, string | null, StateProps>(
  state => state.matchDetails,
  matchesPermissions('hosting advisor'),
  getUsername,
  (details, isHostingAdvisor, username): StateProps => ({
    details,
    canApprove: details.match !== null && !details.match.removed && !details.match.approvedBy && isHostingAdvisor,
    canRemove:
      details.match !== null &&
      !details.match.removed &&
      (isHostingAdvisor || (username != null && username === details.match.author)),
  }),
);

// TODO get rid of ownprops
const dispatch = (dispatch: Dispatch, props?: OwnProps): DispatchProps => ({
  clear: () => dispatch(FetchMatchDetails.clear()),
  load: (id: number) => dispatch(FetchMatchDetails.start({ id })),
  approve: () => dispatch(ApproveMatch.openDialog(props!.id)),
  remove: () => dispatch(RemoveMatch.openDialog(props!.id)),
});

export const MatchDetails: React.ComponentType<OwnProps> = connect<StateProps, DispatchProps, OwnProps>(
  stateSelector,
  dispatch,
)(MatchDetailsComponent);
