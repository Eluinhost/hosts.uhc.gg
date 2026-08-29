import React, { useCallback, useEffect } from 'react';
import { InjectedFormProps, reduxForm } from 'redux-form';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from 'reselect';
import { Button, Classes, Dialog, Intent } from '@blueprintjs/core';
import { ApplicationState } from '../../state/ApplicationState';
import { RulesField } from './RulesField';
import { SetHostingRules } from '../../actions';
import { Validator } from '../../services/Validator';

type SetRulesDialogData = {
  rules: string;
};

type SetRulesDialogState = {
  readonly isOpen: boolean;
  readonly isDarkMode: boolean;
  readonly currentRules: string;
};

const setRulesSelector = createSelector(
  (state: ApplicationState) => state.rules.editing,
  (state: ApplicationState) => state.rules.data,
  (state: ApplicationState) => state.settings.isDarkMode,
  (isOpen, data, isDarkMode): SetRulesDialogState => ({
    isOpen,
    currentRules: data ? data.content : '',
    isDarkMode,
  }),
);

const validator = new Validator<SetRulesDialogData>().withValidation(
  'rules',
  rules => !rules || rules.length < 3,
  'Must be at least 3 characters long',
);

const SetRulesDialogComponent: React.FunctionComponent<
  SetRulesDialogState &
    InjectedFormProps<SetRulesDialogData, SetRulesDialogState>
> = ({ handleSubmit, submitting, invalid, isOpen, currentRules, change, isDarkMode }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (isOpen) {
      change('rules', currentRules || '');
    }
  }, [isOpen, currentRules, change]);

  const onClose = useCallback(
    () => dispatch(SetHostingRules.closeEditor()),
    [dispatch],
  );

  return (
    <Dialog
      icon="take-action"
      isOpen={isOpen}
      onClose={onClose}
      title="Modify Rules"
      className={isDarkMode ? Classes.DARK : ''}
    >
      <div className={Classes.DIALOG_BODY}>
        <form onSubmit={handleSubmit}>
          <RulesField
            name="rules"
            label="Rules"
            required
            disabled={submitting}
            className={Classes.FILL}
          />
        </form>
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button onClick={onClose} icon="arrow-left">
            Cancel
          </Button>
          <Button
            intent={Intent.SUCCESS}
            onClick={handleSubmit}
            disabled={invalid || submitting}
            icon="add"
          >
            Update Rules
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

const SetRulesDialogForm: React.ComponentType<SetRulesDialogState> = reduxForm<
  SetRulesDialogData,
  SetRulesDialogState
>({
  form: 'set-rules-form',
  validate: validator.validate,
  onSubmit: (values, dispatch) => {
    dispatch(SetHostingRules.start(values.rules));
    dispatch(SetHostingRules.closeEditor());
  },
})(SetRulesDialogComponent);

export const SetRulesDialog: React.ComponentType = () => {
  const state = useSelector(setRulesSelector);
  return <SetRulesDialogForm {...state} />;
};
