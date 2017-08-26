import { BanEntry } from '../../BanEntry';
import * as React from 'react';
import { WithPermission } from '../WithPermission';
import { Button, Dialog, Intent, Tag } from '@blueprintjs/core';
import { AppToaster } from '../../AppToaster';
import { Link } from 'react-router-dom';
import { deleteBan } from '../../api/index';

type UblEntryRowProps = {
  readonly ban: BanEntry;
  readonly className?: string;
  readonly onDeleteStart: (ban: BanEntry) => void;
  readonly onDeleted: (ban: BanEntry) => void;
  readonly onDeleteFailed: (ban: BanEntry) => void;
  readonly onEditStart: (ban: BanEntry, oldBan: BanEntry) => void;
  readonly onEdited: (ban: BanEntry, oldBan: BanEntry) => void;
  readonly onEditFailed: (ban: BanEntry, oldBan: BanEntry) => void;
  readonly accessToken: string | null;
  readonly disabled: boolean;
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
    const ban = this.props.ban;

    this.closeDeleteDialog();
    this.props.onDeleteStart(ban);

    deleteBan(ban.id, this.props.accessToken!)
      .then(() => {
        AppToaster.show({
          message: `Ban #${ban.id} deleted`,
          intent: Intent.SUCCESS,
        });
        this.props.onDeleted(ban);
      })
      .catch(() => {
        AppToaster.show({
          message: `Unexpected response from the server deleting ban #${ban.id}`,
          intent: Intent.DANGER,
        });
        this.props.onDeleteFailed(ban);
      });
  }

  openEditDialog = () => this.setState({
    isEditOpen: true,
  })

  closeEditDialog = () => this.setState({
    isEditOpen: false,
  })

  confirmEdit = () => {
    const oldBan = this.props.ban;
    const newBan = {
      ...this.props.ban,
      ign: `${this.props.ban.ign}-test`,
    }; // TODO API calls + actual edits

    this.closeEditDialog();
    this.props.onEditStart(newBan, oldBan);

    Promise.resolve()
      .then(() => {
        AppToaster.show({
          message: `Ban #${oldBan.id} edited`,
          intent: Intent.SUCCESS,
        });
        this.props.onEdited(newBan, oldBan);
      })
      .catch(() => {
        AppToaster.show({
          message: `Unexpected response from the server editing ban #${oldBan.id}`,
          intent: Intent.DANGER,
        });
        this.props.onEditFailed(newBan, oldBan);
      });
  }

  renderCaseLink = (link: string) => {
    if (/^https?/.test(link)) {
      return (
        <a href={link} target="_blank">
          <Button
            intent={Intent.PRIMARY}
            className="pt-minimal pt-large"
            iconName="take-action"
            title="Open case link"
            disabled={this.props.disabled}
          />
        </a>
      );
    }

    return (
      <Button
        intent={Intent.DANGER}
        className="pt-minimal pt-large"
        iconName="take-action"
        title="No case link available"
        disabled={this.props.disabled}
      />
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
                <Button
                  intent={Intent.WARNING}
                  className="pt-minimal pt-large"
                  iconName="edit"
                  title="Modify Ban"
                  onClick={this.openEditDialog}
                  disabled={this.props.disabled}
                />
                <Button
                  intent={Intent.DANGER}
                  className="pt-minimal pt-large"
                  iconName="trash"
                  title="Delete Ban"
                  onClick={this.openDeleteDialog}
                  disabled={this.props.disabled}
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
            NOT IMPLEMENTED YET
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
