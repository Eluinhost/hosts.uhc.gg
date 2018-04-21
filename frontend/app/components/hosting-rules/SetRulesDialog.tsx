import * as React from 'react';
import { FormProps, reduxForm } from 'redux-form';
import { ApplicationState } from '../../state/ApplicationState';
import { Button, Dialog, Intent } from '@blueprintjs/core';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { RulesField } from './RulesField';
import { SetHostingRules } from '../../actions';
import { Validator } from '../../services/Validator';

type SetRulesDialogData = {
  rules: string;
};

type SetRulesDialogDispatchProps = {
  readonly close: () => void;
};

type SetRulesDialogStateProps = {
  readonly isOpen: boolean;
  readonly isDarkMode: boolean;
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
  SetRulesDialogStateProps & SetRulesDialogDispatchProps & FormProps<SetRulesDialogData, {}, ApplicationState>
> = ({ handleSubmit, submitting, invalid, close, isOpen, currentRules, change, isDarkMode }) => (
  <Dialog
    icon="take-action"
    isOpen={isOpen}
    onClose={close}
    title="Modify Rules"
    className={isDarkMode ? 'pt-dark' : ''}
  >
    <SetRulesDialogHelper current={currentRules} change={change!} />
    <div className="pt-dialog-body">
      <form onSubmit={handleSubmit}>
        <RulesField name="rules" label="Rules" required disabled={submitting} className="pt-fill" />
      </form>
    </div>
    <div className="pt-dialog-footer">
      <div className="pt-dialog-footer-actions">
        <Button onClick={close} icon="arrow-left">
          Cancel
        </Button>
        <Button intent={Intent.SUCCESS} onClick={handleSubmit} disabled={invalid || submitting} icon="add">
          Update Rules
        </Button>
      </div>
    </div>
  </Dialog>
);

const validator = new Validator<SetRulesDialogData>().withValidation(
  'rules',
  rules => !rules || rules.length < 3,
  'Must be at least 3 characters long',
);

const SetRulesDialogForm: React.SFC<SetRulesDialogStateProps & SetRulesDialogDispatchProps> = reduxForm<
  SetRulesDialogData,
  SetRulesDialogStateProps & SetRulesDialogDispatchProps,
  ApplicationState
>({
  form: 'set-rules-form',
  validate: validator.validate,
  onSubmit: (values, dispatch, props) => {
    dispatch(SetHostingRules.start(values.rules));
    props.close();
  },
})(SetRulesDialogComponent);

export const SetRulesDialog: React.ComponentClass = connect<SetRulesDialogStateProps, SetRulesDialogDispatchProps, {}>(
  (state: ApplicationState): SetRulesDialogStateProps => ({
    isOpen: state.rules.editing,
    currentRules: state.rules.data ? state.rules.data.content : '',
    isDarkMode: state.settings.isDarkMode,
  }),
  (dispatch: Dispatch<ApplicationState>): SetRulesDialogDispatchProps => ({
    close: () => dispatch(SetHostingRules.closeEditor()),
  }),
)(SetRulesDialogForm);
