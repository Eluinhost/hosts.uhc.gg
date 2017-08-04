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
};

const SetRulesDialogComponent: React.SFC<
  SetRulesDialogStateProps &
  SetRulesDialogDispatchProps &
  FormProps<SetRulesDialogData, {}, ApplicationState>> =
  ({ handleSubmit, submitting, invalid, close, isOpen }) => (
    <Dialog
      iconName="take-action"
      isOpen={isOpen}
      onClose={close}
      title="Modify Rules"
      className="pt-dark"
    >
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

const mapStateToProps = (state: ApplicationState): SetRulesDialogStateProps => ({
  isOpen: state.rules.editing,
});

const mapDispatchToProps = (dispatch: Dispatch<ApplicationState>): SetRulesDialogDispatchProps => ({
  close: (): void => {
    dispatch(HostingRulesActions.closeEditor());
  },
  confirm: (rules: string): Promise<void> => {
    dispatch(HostingRulesActions.closeEditor());
    return dispatch(HostingRulesActions.setRules(rules));
  },
});

export const SetRulesDialog: React.ComponentClass =
  connect<SetRulesDialogStateProps, SetRulesDialogDispatchProps, {}>(
    mapStateToProps,
    mapDispatchToProps,
  )(SetRulesDialogForm);
