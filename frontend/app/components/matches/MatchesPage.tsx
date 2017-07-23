import * as React from 'react';
import { MatchesState } from '../../state/MatchesState';
import { FetchError } from './FetchError';
import { Button, Intent } from '@blueprintjs/core';
import { NoMatches } from './NoMatches';
import { MatchRow } from './MatchRow';
import { Loader } from './Loader';
import { RouteComponentProps } from 'react-router';
import { RemovalModal } from './RemovalModal';

export type MatchesPageDispatchProps = {
  readonly refetch: () => any;
  readonly openModal: (id: number) => any;
  readonly closeModal: () => any;
  readonly submitRemoval: (reason: string) => Promise<any>;
};

export type MatchesPageStateProps = {
  readonly isModalOpen: boolean;
  readonly isModerator: boolean;
  readonly username: string;
} & MatchesState;

export class MatchesPage
  extends React.Component<MatchesPageStateProps & MatchesPageDispatchProps & RouteComponentProps<any>> {
  componentDidMount() {
    this.props.refetch();
  }

  renderMatches = () => this.props.matches.map((match) => {
    const onRemovePress = () => this.props.openModal(match.id);

    return (
      <MatchRow
        match={match}
        key={match.id}
        onRemovePress={onRemovePress}
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

        <FetchError loading={this.props.fetching} error={this.props.error} />
        <Loader loading={this.props.fetching} />
        {this.props.matches.length ? this.renderMatches() : <NoMatches/>}

        <RemovalModal
          isOpen={this.props.isModalOpen}
          confirm={this.props.submitRemoval}
          close={this.props.closeModal}
        />
      </div>
    );
  }
}
