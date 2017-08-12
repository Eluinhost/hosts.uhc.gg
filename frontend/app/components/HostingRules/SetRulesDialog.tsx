import * as React from 'react';
import { FormProps, reduxForm, SubmissionError } from 'redux-form';
import { ApplicationState } from '../../state/ApplicationState';
import { Button, Dialog, Intent } from '@blueprintjs/core';
import { Spec, validate } from '../../validate';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { RulesField } from './RulesField';
import { HostingRulesActions } from '../../state/HostingRulesState';

type SetRulesDialogData = {
  rules: string;
};

type SetRulesDialogDispatchProps = {
  readonly close: () => void;
  readonly confirm: (rules: string) => Promise<void>;
};

type SetRulesDialogStateProps = {
  readonly isOpen: boolean;
  readonly currentRules: string;
};

// Simple component that exists just to pull the latest rules into the form once the dialog renders it's body
class SetRulesDialogHelper extends React.Component<{
  readonly current: string | null;
  readonly change: (field: string, value: string) => void;
}> {

  componentDidMount() {
    this.props.change('rules', this.props.current || '');
  }

  render() {
    return null;
  }
}

const SetRulesDialogComponent: React.SFC<
  SetRulesDialogStateProps &
  SetRulesDialogDispatchProps &
  FormProps<SetRulesDialogData, {}, ApplicationState>> =
  ({ handleSubmit, submitting, invalid, close, isOpen, currentRules, change }) => (
    <Dialog
      iconName="take-action"
      isOpen={isOpen}
      onClose={close}
      title="Modify Rules"
      className="pt-dark"
    >
      <SetRulesDialogHelper current={currentRules} change={change!} />
      <div className="pt-dialog-body">
        <form onSubmit={handleSubmit}>
          <RulesField name="rules" label="Rules" required disabled={submitting} className="pt-fill" />
        </form>
      </div>
      <div className="pt-dialog-footer">
        <div className="pt-dialog-footer-actions">
          <Button
            onClick={close}
            iconName="arrow-left"
          >
            Cancel
          </Button>
          <Button
            intent={Intent.SUCCESS}
            onClick={handleSubmit}
            disabled={invalid || submitting}
            iconName="add"
          >
            Update Rules
          </Button>
        </div>
      </div>
    </Dialog>
  );

const validationSpec: Spec<SetRulesDialogData> = {
  rules: (rules) => {
    if (!rules)
      return 'This field is required';

    if (rules.length < 3)
      return 'Must be at least 3 characters long';

    return undefined;
  },
};

const SetRulesDialogForm: React.SFC<SetRulesDialogStateProps & SetRulesDialogDispatchProps> =
  reduxForm<
    SetRulesDialogData,
    SetRulesDialogStateProps & SetRulesDialogDispatchProps,
    ApplicationState
  >({
    form: 'set-rules-form',
    validate: validate(validationSpec),
    onSubmit: async (values, dispatch, props): Promise<void> => {
      try {
        props.confirm(values.rules);
      } catch (err) {
        throw new SubmissionError({ reason: 'Unexpected response from the server' });
      }
    },
  })(SetRulesDialogComponent);

export const SetRulesDialog: React.ComponentClass =
  connect<SetRulesDialogStateProps, SetRulesDialogDispatchProps, {}>(
    (state: ApplicationState): SetRulesDialogStateProps => ({
      isOpen: state.rules.editing,
      currentRules: state.rules.data ? state.rules.data.content : '',
    }),
    (dispatch: Dispatch<ApplicationState>): SetRulesDialogDispatchProps => ({
      close: (): void => {
        dispatch(HostingRulesActions.closeEditor());
      },
      confirm: (rules: string): Promise<void> => {
        dispatch(HostingRulesActions.closeEditor());
        return dispatch(HostingRulesActions.setRules(rules));
      },
    }),
  )(SetRulesDialogForm);
