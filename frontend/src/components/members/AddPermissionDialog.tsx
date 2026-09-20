import { Button, Classes, Dialog, Intent } from '@blueprintjs/core';
import { AddIcon, ArrowLeftIcon } from '@blueprintjs/icons';
import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from 'reselect';
import { enforce, create, test } from 'vest';

import { AddPermission } from '../../actions';
import { FormLabel } from '../../forms/FormLabel';
import { useAppForm } from '../../forms/useAppForm';
import type { ApplicationState } from '../../state/ApplicationState';

const addPermissionSelector = createSelector(
  (state: ApplicationState) => state.permissions.addDialog,
  (state: ApplicationState) => state.settings.isDarkMode,
  (state, isDarkMode) => ({ state, isDarkMode }),
);

const schema = enforce.shape({
  username: enforce.isString(),
});

export const suite = create(data => {
  test('username', 'This field is required', () => {
    enforce(data.username).isString().min(1);
  });
}, schema);

export const AddPermissionDialog: React.FC = () => {
  const dispatch = useDispatch();
  const { state, isDarkMode } = useSelector(addPermissionSelector);

  const onClose = useCallback(() => dispatch(AddPermission.closeDialog()), [dispatch]);

  const form = useAppForm({
    defaultValues: {
      username: '',
    },
    validators: [
      {
        run: suite,
        triggers: ['change'],
      },
    ],
    onSubmit: state => {
      dispatch(AddPermission.start(state.value.username));
      dispatch(AddPermission.closeDialog());
    },
  });

  return (
    <Dialog
      icon={<AddIcon />}
      isOpen={!!state}
      onClose={onClose}
      title={`Add '${state ? state.permission : 'NOT OPEN'}' role`}
      className={isDarkMode ? Classes.DARK : ''}
    >
      <div className={`${Classes.DIALOG_BODY} add-permission-body`}>
        <form
          onSubmit={e => {
            e.preventDefault();
            void form.handleSubmit();
          }}
        >
          <form.Field name="username">
            {field => (
              <FormLabel field={field} label="Username" showRequiredStar fill>
                <field.TextField field={field} fill />
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
          <Button
            type="submit"
            intent={Intent.SUCCESS}
            onClick={() => {
              void form.handleSubmit();
            }}
            disabled={!form.state.canSubmit}
            icon={<AddIcon />}
          >
            Add Permission
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
