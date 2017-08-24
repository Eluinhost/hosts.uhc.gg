import { BanEntry } from '../../BanEntry';
import * as React from 'react';
import { WithPermission } from '../WithPermission';
import { Button, Dialog, Intent, Tag } from '@blueprintjs/core';
import { AppToaster } from '../../AppToaster';
import { Link } from 'react-router-dom';

type UblEntryRowProps = {
  readonly ban: BanEntry;
  readonly className?: string;
  readonly onDeleted: (id: number) => void;
  readonly onEdited: (ban: BanEntry, oldBan: BanEntry) => void;
};

type State = {
  readonly isEditOpen: boolean;
  readonly isDeleteOpen: boolean;
};

export class UblEntryRow extends React.Component<UblEntryRowProps, State> {
  state = {
    isEditOpen: false,
    isDeleteOpen: false,
  };

  openDeleteDialog = () => this.setState({
    isDeleteOpen: true,
  })

  closeDeleteDialog = () => this.setState({
    isDeleteOpen: false,
  })

  confirmDelete = () => {
    console.log(`deleting ${this.props.ban.id}`);
    this.closeDeleteDialog();

    // TODO api calls
    Promise
      .resolve()
      .then(() => {
        AppToaster.show({
          message: `Ban #${this.props.ban.id} deleted`,
          intent: Intent.SUCCESS,
        });
        this.props.onDeleted(this.props.ban.id);
      });
  }

  openEditDialog = () => this.setState({
    isEditOpen: true,
  })

  closeEditDialog = () => this.setState({
    isEditOpen: false,
  })

  confirmEdit = () => {
    console.log(`editing ${this.props.ban.id}`);

    AppToaster.show({
      message: `Ban #${this.props.ban.id} edited`,
      intent: Intent.SUCCESS,
    });

    this.closeEditDialog();

    // TODO API calls + actual edits
    this.props.onEdited(
      {
        ...this.props.ban,
        ign: `${this.props.ban.ign}-test`,
      },
      this.props.ban,
    );
  }

  renderCaseLink = (link: string) => {
    if (/^https?/.test(link)) {
      return (
        <a href={link} target="_blank">
          <Tag intent={Intent.PRIMARY} className="pt-minimal pt-icon-take-action pt-large" title="Open case link"/>
        </a>
      );
    }

    return (
      <Tag intent={Intent.DANGER} className="pt-minimal pt-icon-take-action pt-large" title="No case link available" />
    );
  }

  render() {
    const { ban } = this.props;

    return (
      <div className={`pt-card ubl-card ${this.props.className || ''}`}>
        <div>
          <span style={{ fontWeight: 'bold' }} title="IGN">{ban.ign}</span>
          <span style={{ float: 'right' }}>
            <span title="Created">{ban.created.format('MMM Do, YYYY')}</span>
            <span> → </span>
            <span title="Expires">{ban.expires.format('MMM Do, YYYY')}</span>
          </span>
        </div>
        <div>
          <Link to={`/ubl/${ban.uuid}`} title="Show ban history">
            <small>{ban.uuid}</small>
          </Link>
          <span style={{ float: 'right' }}>/u/{ban.createdBy}</span>
        </div>
        <div>
          <em>{ban.reason} - {ban.expires.from(ban.created, true)}</em>
          <div style={{ float: 'right' }}>
            {this.renderCaseLink(ban.link)}
            <WithPermission permission="moderator">
              <span>
                <Tag
                  style={{ cursor: 'pointer' }}
                  intent={Intent.WARNING}
                  className="pt-minimal pt-icon-edit pt-large"
                  title="Modify Ban"
                  onClick={this.openEditDialog}
                />
                <Tag
                  style={{ cursor: 'pointer' }}
                  intent={Intent.DANGER}
                  className="pt-minimal pt-icon-trash pt-large"
                  title="Delete Ban"
                  onClick={this.openDeleteDialog}
                />
              </span>
            </WithPermission>
          </div>
        </div>
        <Dialog
          title="Edit Ban"
          className="pt-dark"
          isOpen={this.state.isEditOpen}
          iconName="trash"
          onClose={this.closeEditDialog}
        >
          <div className="pt-dialog-body">
            test
          </div>
          <div className="pt-dialog-footer">
            <div className="pt-dialog-footer-actions">
              <Button text="Close" onClick={this.closeEditDialog} />
              <Button
                intent={Intent.SUCCESS}
                onClick={this.confirmEdit}
                text="Update"
                iconName="cloud-upload"
              />
            </div>
          </div>
        </Dialog>

        <Dialog
          title="Delete Ban"
          className="pt-dark"
          isOpen={this.state.isDeleteOpen}
          iconName="trash"
          onClose={this.closeDeleteDialog}
        >
          <div className="pt-dialog-body">
            <p>
              Are you sure you want to delete this? It cannot be undone.
              If you want to make a Ban expire early you should edit it instead
            </p>
          </div>
          <div className="pt-dialog-footer">
            <div className="pt-dialog-footer-actions">
              <Button text="Close" onClick={this.closeDeleteDialog} />
              <Button
                intent={Intent.DANGER}
                onClick={this.confirmDelete}
                text="Delete"
                iconName="trash"
              />
            </div>
          </div>
        </Dialog>
      </div>
    );
  }
}
