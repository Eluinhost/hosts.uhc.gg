import { Button, Classes, Dialog, Intent } from '@blueprintjs/core';
import { AddIcon, ArrowLeftIcon, TakeActionIcon } from '@blueprintjs/icons';
import React, { useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from 'redux';
import { type InjectedFormProps, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';

import { SetHostingRules } from '../../actions';
import { Validator } from '../../services/Validator';
import type { ApplicationState } from '../../state/ApplicationState';

import { RulesField } from './RulesField';

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

const SetRulesDialogComponent: React.FC<InjectedFormProps<SetRulesDialogData>> = ({
  handleSubmit,
  submitting,
  invalid,
  // coming from 3rd party, safe
  // eslint-disable-next-line @typescript-eslint/unbound-method
  change,
}) => {
  const dispatch = useDispatch();
  const { currentRules, isDarkMode, isOpen } = useSelector(setRulesSelector);

  useEffect(() => {
    if (isOpen) {
      change('rules', currentRules || '');
    }
  }, [isOpen, currentRules, change]);

  const onClose = useCallback(() => dispatch(SetHostingRules.closeEditor()), [dispatch]);

  return (
    <Dialog
      icon={<TakeActionIcon />}
      isOpen={isOpen}
      onClose={onClose}
      title="Modify Rules"
      className={isDarkMode ? Classes.DARK : ''}
    >
      <div className={Classes.DIALOG_BODY}>
        <form onSubmit={handleSubmit}>
          <RulesField name="rules" label="Rules" required disabled={submitting} className={Classes.FILL} />
        </form>
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button onClick={onClose} icon={<ArrowLeftIcon />}>
            Cancel
          </Button>
          <Button intent={Intent.SUCCESS} onClick={handleSubmit} disabled={invalid || submitting} icon={<AddIcon />}>
            Update Rules
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export const SetRulesDialog = reduxForm<SetRulesDialogData>({
  form: 'set-rules-form',
  validate: validator.validate,
  onSubmit: (values: SetRulesDialogData, dispatch: Dispatch) => {
    dispatch(SetHostingRules.start(values.rules));
    dispatch(SetHostingRules.closeEditor());
  },
})(SetRulesDialogComponent);
