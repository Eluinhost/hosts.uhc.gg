import { BanEntry } from '../../models/BanEntry';
import * as React from 'react';
import { WithPermission } from '../WithPermission';
import { AnchorButton, Button, Card, Classes, Dialog, Intent } from '@blueprintjs/core';
import { AppToaster } from '../../services/AppToaster';
import { Link } from 'react-router-dom';
import { UBLApi } from '../../api';
import { BanData, BanDataForm } from './BanDataForm';

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
  readonly isDarkMode: boolean;
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

  openDeleteDialog = () =>
    this.setState({
      isDeleteOpen: true,
    });

  openEditDialog = () =>
    this.setState({
      isEditOpen: true,
    });

  closeDeleteDialog = () =>
    this.setState({
      isDeleteOpen: false,
    });

  closeEditDialog = () =>
    this.setState({
      isEditOpen: false,
    });

  confirmDelete = () => {
    const ban = this.props.ban;

    this.closeDeleteDialog();
    this.props.onDeleteStart(ban);

    UBLApi.callDeleteBan(ban.id, this.props.accessToken!)
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
  };

  confirmEdit = (values: BanData) => {
    const oldBan = this.props.ban;
    const newBan = {
      ...oldBan,
      ...values,
    };

    this.closeEditDialog();
    this.props.onEditStart(newBan, oldBan);

    return UBLApi.callEditBan(oldBan.id, values, this.props.accessToken!)
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
  };

  renderCaseLink = (link: string) => {
    if (/^https?/.test(link)) {
      return (
        <AnchorButton
          href={link}
          target="_blank"
          minimal
          intent={Intent.PRIMARY}
          icon="take-action"
          title="Open case link"
          disabled={this.props.disabled}
          rel="noopener noreferrer"
        />
      );
    }

    return (
      <Button
        intent={Intent.DANGER}
        minimal
        icon="take-action"
        title="No case link available"
        disabled={this.props.disabled}
      />
    );
  };

  render() {
    const { ban } = this.props;

    return (
      <Card className={`ubl-card ${this.props.className || ''}`}>
        <div>
          <span style={{ fontWeight: 'bold' }} title="IGN">
            {ban.ign}
          </span>
          <span style={{ float: 'right' }}>
            <span title="Created">{ban.created.format('MMM Do, YYYY')}</span>
            <span> → </span>
            <span title="Expires">{ban.expires ? ban.expires.format('MMM Do, YYYY') : 'Never'}</span>
          </span>
        </div>
        <div>
          <Link to={`/ubl/${ban.uuid}`} title="Show ban history" className="ubl-link">
            <small>{ban.uuid}</small>
          </Link>
          <span style={{ float: 'right' }}>/u/{ban.createdBy}</span>
        </div>
        <div>
          <em>
            {ban.reason} - {ban.expires ? ban.expires.from(ban.created, true) : 'Permanent Ban'}
          </em>
          <div style={{ float: 'right' }}>
            {this.renderCaseLink(ban.link)}
            <WithPermission permission="ubl moderator">
              <span>
                <Button
                  intent={Intent.WARNING}
                  minimal
                  icon="edit"
                  title="Modify Ban"
                  onClick={this.openEditDialog}
                  disabled={this.props.disabled}
                />
                <Button
                  intent={Intent.DANGER}
                  minimal
                  icon="trash"
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
          className={this.props.isDarkMode ? Classes.DARK : ''}
          isOpen={this.state.isEditOpen}
          icon="trash"
          onClose={this.closeEditDialog}
        >
          <div className={Classes.DIALOG_BODY}>
            <BanDataForm submitBan={this.confirmEdit} initialValues={this.props.ban} />
          </div>
          <div className={Classes.DIALOG_FOOTER}>
            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
              <Button text="Close" onClick={this.closeEditDialog} />
            </div>
          </div>
        </Dialog>

        <Dialog
          title="Delete Ban"
          className={this.props.isDarkMode ? Classes.DARK : ''}
          isOpen={this.state.isDeleteOpen}
          icon="trash"
          onClose={this.closeDeleteDialog}
        >
          <div className={Classes.DIALOG_BODY}>
            <p>
              Are you sure you want to delete this? It cannot be undone. If you want to make a Ban expire early you
              should edit it instead
            </p>
          </div>
          <div className={Classes.DIALOG_FOOTER}>
            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
              <Button text="Close" onClick={this.closeDeleteDialog} />
              <Button intent={Intent.DANGER} onClick={this.confirmDelete} text="Delete" icon="trash" />
            </div>
          </div>
        </Dialog>
      </Card>
    );
  }
}
