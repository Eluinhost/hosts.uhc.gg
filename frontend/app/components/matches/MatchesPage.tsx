import * as React from 'react';
import { MatchesState } from '../../state/MatchesState';
import { FetchError } from './FetchError';
import { Button, Intent, Overlay } from '@blueprintjs/core';
import { NoMatches } from './NoMatches';
import { MatchRow } from './MatchRow';
import { Loader } from './Loader';
import { RouteComponentProps } from 'react-router';

export type MatchesPageDispatchProps = {
  readonly refetch: () => any;
  readonly askForReason: (id: number) => any;
  readonly updateReason: (reason: string) => any;
  readonly closeModal: () => any;
  readonly confirmRemove: () => any;
};

export type MatchesPageStateProps = {
  readonly isModerator: boolean;
  readonly username: string;
} & MatchesState;

export class MatchesPage
  extends React.Component<MatchesPageStateProps & MatchesPageDispatchProps & RouteComponentProps<any>> {
  componentDidMount() {
    this.props.refetch();
  }

  renderMatches = () => this.props.matches.map((match) => {
    const onRemovePress = () => this.props.askForReason(match.id);

    return (
      <MatchRow
        match={match}
        key={match.id}
        onRemovePress={onRemovePress}
        canRemove={this.props.isModerator || this.props.username === match.author}
      />
    );
  })

  onRemovalReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => this.props.updateReason(e.target.value);

  render() {
    const validReason = this.props.removal.validReason;

    return (
      <div>
        <Button
          disabled={this.props.fetching}
          onClick={this.props.refetch}
          iconName="refresh"
          intent={Intent.SUCCESS}
        >
          Refresh
        </Button>

        <FetchError loading={this.props.fetching} error={this.props.error} />
        <Loader loading={this.props.fetching} />
        {this.props.matches.length ? this.renderMatches() : <NoMatches/>}

        <Overlay
          isOpen={this.props.removal.isModalOpen}
          autoFocus
          canEscapeKeyClose
          canOutsideClickClose
          hasBackdrop
          inline={false}
          onClose={this.props.closeModal}
        >
          <div className="pt-card pt-elevation-4 remove-match-modal">
            <h3>Are you sure you want to remove this game? This cannot be undone</h3>

            <label>Reason: (required)</label>
            <textarea
              className={`pt-input pt-fill ${validReason ? 'pt-intent-success' : 'pt-intent-danger'}`}
              value={this.props.removal.reason}
              onChange={this.onRemovalReasonChange}
            />

            {this.props.removal.error && <span>{this.props.removal.error}</span>}

            <Button
              onClick={this.props.closeModal}
              disabled={this.props.removal.fetching}
              iconName="arrow-left"
            >
              Cancel
            </Button>
            <Button
              intent={Intent.DANGER}
              onClick={this.props.confirmRemove}
              disabled={!validReason || this.props.removal.fetching}
              iconName="delete"
            >
              Remove
            </Button>
          </div>
        </Overlay>
      </div>
    );
  }
}
