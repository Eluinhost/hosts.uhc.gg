import * as React from 'react';
import moment from 'moment-timezone';
import { Button, Classes, Dialog, H4, Intent, Spinner, Tag, TextArea } from '@blueprintjs/core';
import { HostApplication, HostApplicationDetails } from '../../models/HostApplication';
import { ApiErrors, PermissionsApi } from '../../api';

type Props = {
  readonly application: HostApplication;
  readonly canReview: boolean;
  readonly isOwn: boolean;
  readonly accessToken: string;
  readonly onReviewed: () => void;
};

type State = {
  readonly expanded: boolean;
  readonly loadingDetails: boolean;
  readonly details: HostApplicationDetails | null;
  readonly error: string | null;
  readonly reviewing: boolean;
  readonly declineDialogOpen: boolean;
  readonly declineReason: string;
};

const statusIntent = (status: HostApplication['status']): Intent => {
  if (status === 'approved') return Intent.SUCCESS;
  if (status === 'declined') return Intent.DANGER;
  return Intent.WARNING;
};

export class ExistingHostApplication extends React.PureComponent<Props, State> {
  state: State = {
    expanded: false,
    loadingDetails: false,
    details: null,
    error: null,
    reviewing: false,
    declineDialogOpen: false,
    declineReason: '',
  };

  private toggleExpanded = () => {
    if (this.state.expanded) {
      this.setState({ expanded: false });
      return;
    }

    this.setState({ expanded: true, loadingDetails: true, error: null });
    PermissionsApi.fetchHostApplicationDetails(this.props.application.id, this.props.accessToken)
      .then(details => this.setState({ details, loadingDetails: false }))
      .catch(() => this.setState({ loadingDetails: false, error: 'Unable to load application details' }));
  };

  private review = (decision: 'approve' | 'decline', reason?: string) => {
    this.setState({ reviewing: true });
    PermissionsApi.reviewHostApplication(this.props.application.id, decision, this.props.accessToken, reason)
      .then(() => {
        this.setState({ reviewing: false, declineDialogOpen: false, declineReason: '' });
        this.props.onReviewed();
      })
      .catch(error => {
        const message =
          error instanceof ApiErrors.BadDataError
            ? error.message.replace(/^User supplied invalid data: /, '')
            : `Unable to ${decision} application`;
        this.setState({ reviewing: false, error: message });
      });
  };

  private openDeclineDialog = () => this.setState({ declineDialogOpen: true, declineReason: '' });

  private closeDeclineDialog = () => this.setState({ declineDialogOpen: false });

  private onDeclineReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const declineReason = e.target.value;
    this.setState({ declineReason });
  };

  private confirmDecline = () => this.review('decline', this.state.declineReason);

  render() {
    const { application, canReview, isOwn } = this.props;
    const { expanded, loadingDetails, details, error, reviewing, declineDialogOpen, declineReason } = this.state;

    return (
      <div
        className={`${Classes.CARD} ${Classes.ELEVATION_1}`}
        style={isOwn ? { marginBottom: 15, borderLeft: '4px solid #2B95D6' } : { marginBottom: 15 }}
      >
        <H4>
          /u/{application.username} <Tag intent={statusIntent(application.status)}>{application.status}</Tag>{' '}
          {isOwn && <Tag intent={Intent.PRIMARY}>Your application</Tag>}
        </H4>
        <small>{moment.utc(application.created).format('MMM Do YYYY, HH:mm z')}</small>
        {application.reviewedBy && (
          <p>
            Reviewed by /u/{application.reviewedBy}
            {application.reviewedAt && ` on ${moment.utc(application.reviewedAt).format('MMM Do YYYY, HH:mm z')}`}
          </p>
        )}
        {application.status === 'declined' && application.reviewReason && (
          <p>
            <strong>Reason:</strong> {application.reviewReason}
          </p>
        )}

        <div style={{ marginTop: 10 }}>
          <Button minimal icon={expanded ? 'chevron-up' : 'chevron-down'} onClick={this.toggleExpanded}>
            {expanded ? 'Hide answers' : 'View answers'}
          </Button>
        </div>

        {expanded && loadingDetails && <Spinner size={20} />}
        {expanded && error && <p className={Classes.TEXT_MUTED}>{error}</p>}
        {expanded && details && (
          <div style={{ marginTop: 10 }}>
            {details.answers.map((answer, index) => (
              <div key={index} style={{ marginBottom: 10 }}>
                <strong>{answer.questionPrompt}</strong>
                <p>
                  {answer.questionType === 'multiple choice' ? (
                    <>
                      {answer.choiceText}
                      {canReview && answer.choiceCorrect !== null && (
                        <>
                          {' '}
                          <Tag intent={answer.choiceCorrect ? Intent.SUCCESS : Intent.DANGER}>
                            {answer.choiceCorrect ? 'correct' : 'incorrect'}
                          </Tag>
                        </>
                      )}
                    </>
                  ) : (
                    answer.textAnswer
                  )}
                </p>
              </div>
            ))}
          </div>
        )}

        {canReview && application.status === 'pending' && (
          <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
            <Button intent={Intent.SUCCESS} icon="tick" loading={reviewing} onClick={() => this.review('approve')}>
              Approve
            </Button>
            <Button intent={Intent.DANGER} icon="cross" loading={reviewing} onClick={this.openDeclineDialog}>
              Decline
            </Button>
          </div>
        )}

        <Dialog isOpen={declineDialogOpen} title="Decline application" onClose={this.closeDeclineDialog}>
          <div className={Classes.DIALOG_BODY}>
            <p>Please provide a reason for declining this application. This will be visible to the applicant.</p>
            <TextArea
              fill
              growVertically
              value={declineReason}
              onChange={this.onDeclineReasonChange}
              placeholder="Reason for declining"
            />
          </div>
          <div className={Classes.DIALOG_FOOTER}>
            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
              <Button onClick={this.closeDeclineDialog}>Cancel</Button>
              <Button
                intent={Intent.DANGER}
                loading={reviewing}
                disabled={declineReason.trim().length === 0}
                onClick={this.confirmDecline}
              >
                Decline
              </Button>
            </div>
          </div>
        </Dialog>
      </div>
    );
  }
}
