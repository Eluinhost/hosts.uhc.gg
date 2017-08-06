import * as React from 'react';
import { MatchesState } from '../../state/MatchesState';
import { Button, Intent, NonIdealState, Spinner } from '@blueprintjs/core';
import { NoMatches } from './NoMatches';
import { MatchRow } from './MatchRow';
import { RouteComponentProps } from 'react-router';
import { RemovalModal } from './RemovalModal';
import { ApprovalModal } from './ApprovalModal';
import { If } from '../If';

export type MatchesPageDispatchProps = {
  readonly refetch: () => void;
  readonly openRemovalModal: (id: number) => void;
  readonly openApprovalModal: (id: number) => void;
  readonly closeRemovalModal: () => void;
  readonly closeApprovalModal: () => void;
  readonly submitRemoval: (reason: string) => Promise<void>;
  readonly submitApproval: () => Promise<void>;
};

export type MatchesPageStateProps = {
  readonly isRemovalModalOpen: boolean;
  readonly isApprovalModalOpen: boolean;
  readonly isModerator: boolean;
  readonly username: string | null;
} & MatchesState;

export class MatchesPage
  extends React.Component<MatchesPageStateProps & MatchesPageDispatchProps & RouteComponentProps<any>> {
  componentDidMount(): void {
    this.props.refetch();
  }

  renderMatches = (): React.ReactElement<any>[] => this.props.matches.map((match) => {
    const onRemovePress = () => this.props.openRemovalModal(match.id);
    const onApprovePress = () => this.props.openApprovalModal(match.id);

    return (
      <MatchRow
        match={match}
        key={match.id}
        onRemovePress={onRemovePress}
        onApprovePress={onApprovePress}
        canRemove={this.props.isModerator || this.props.username === match.author}
      />
    );
  })

  render() {
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

        <If condition={!this.props.fetching && !!this.props.error}>
          <div className="pt-callout pt-intent-danger"><h5>{this.props.error}</h5></div>
        </If>

        <If condition={this.props.fetching}>
          <NonIdealState visual={<Spinner/>} title="Loading..."/>
        </If>

        <If condition={this.props.matches.length > 0} alternative={NoMatches}>
          <div>
            {this.renderMatches()}
          </div>
        </If>

        <RemovalModal
          isOpen={this.props.isRemovalModalOpen}
          confirm={this.props.submitRemoval}
          close={this.props.closeRemovalModal}
        />
        <ApprovalModal
          isOpen={this.props.isApprovalModalOpen}
          confirm={this.props.submitApproval}
          close={this.props.closeApprovalModal}
        />
      </div>
    );
  }
}
