import { Button, Classes, Dialog, Intent } from '@blueprintjs/core';
import { AddIcon, ArrowLeftIcon, TakeActionIcon } from '@blueprintjs/icons';
import React, { useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from 'reselect';
import { create, enforce, test } from 'vest';

import { SetHostingRules } from '../../actions';
import { FormLabel } from '../../forms/FormLabel';
import { useAppForm } from '../../forms/useAppForm';
import type { ApplicationState } from '../../state/ApplicationState';

import { RulesField } from './RulesField';

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

const schema = enforce.shape({
  rules: enforce.isString(),
});

export const suite = create(data => {
  test('rules', 'This field is required', () => {
    enforce(data.rules).isString().isNotEmpty();
  });
  test('rules', 'Must be at least 3 characters long', () => {
    enforce(data.rules).isString().min(3);
  });
}, schema);

export const SetRulesDialog: React.FC = () => {
  const dispatch = useDispatch();
  const { currentRules, isDarkMode, isOpen } = useSelector(setRulesSelector);

  const form = useAppForm({
    defaultValues: { rules: '' },
    validators: [
      {
        run: suite,
        triggers: ['change'],
      },
    ],
    onSubmit: state => {
      dispatch(SetHostingRules.start(state.value.rules));
      dispatch(SetHostingRules.closeEditor());
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.setFieldValue('rules', currentRules || '');
    }
  }, [isOpen, currentRules, form]);

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
        <form
          onSubmit={e => {
            e.preventDefault();
            void form.handleSubmit();
          }}
        >
          <form.Field name="rules">
            {field => (
              <FormLabel field={field} showRequiredStar label="Rules">
                <RulesField field={field} className={Classes.FILL} />
              </FormLabel>
            )}
          </form.Field>
        </form>
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button onClick={onClose} icon={<ArrowLeftIcon />}>
            Cancel
          </Button>
          <form.Subscribe selector={state => state.canSubmit}>
            {canSubmit => (
              <Button
                intent={Intent.SUCCESS}
                onClick={() => void form.handleSubmit()}
                disabled={!canSubmit}
                icon={<AddIcon />}
              >
                Update Rules
              </Button>
            )}
          </form.Subscribe>
        </div>
      </div>
    </Dialog>
  );
};
