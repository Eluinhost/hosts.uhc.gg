import { Button, Classes, Dialog, Intent } from '@blueprintjs/core';
import { AddIcon, ArrowLeftIcon, TakeActionIcon } from '@blueprintjs/icons';
import { useSelector } from 'react-redux';
import { create, enforce, test } from 'vest';

import { FormLabel } from '../../forms/FormLabel';
import { useAppForm } from '../../forms/useAppForm';
import { isDarkMode } from '../../state/Selectors';
import { HostingRulesData } from '../api';

import { RulesField } from './RulesField';

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

export const SetRulesDialog = ({ current, onClose }: { current: string; onClose: () => void }) => {
  const { mutateAsync } = HostingRulesData.mutations.useSetHostingRules();
  const darkMode = useSelector(isDarkMode);

  const form = useAppForm({
    defaultValues: { rules: current },
    validators: [
      {
        run: suite,
        triggers: ['change'],
      },
    ],
    onSubmit: async state => {
      await mutateAsync(state.value.rules);
      onClose();
    },
  });

  return (
    <Dialog
      icon={<TakeActionIcon />}
      isOpen
      onClose={onClose}
      title="Modify Rules"
      className={darkMode ? Classes.DARK : ''}
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
