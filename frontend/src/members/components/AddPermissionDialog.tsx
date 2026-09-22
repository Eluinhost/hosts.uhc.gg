import { Button, Classes, Dialog, Intent } from '@blueprintjs/core';
import { AddIcon, ArrowLeftIcon } from '@blueprintjs/icons';
import { clsx } from 'clsx';
import { useAtomValue } from 'jotai';
import { enforce, create, test } from 'vest';

import { isDarkModeAtom } from '../../atoms/isDarkMode';
import { FormLabel } from '../../forms/FormLabel';
import { useAppForm } from '../../forms/useAppForm';
import { MembersData } from '../api';

const schema = enforce.shape({
  username: enforce.isString(),
});

export const suite = create(data => {
  test('username', 'This field is required', () => {
    enforce(data.username).isString().min(1);
  });
}, schema);

export interface AddPermissionDialogProps {
  permission: string;
  onClose: () => void;
}

export const AddPermissionDialog = ({ permission, onClose }: AddPermissionDialogProps) => {
  const { mutateAsync } = MembersData.mutations.useAddPermission();
  const isDarkMode = useAtomValue(isDarkModeAtom);

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
    onSubmit: async state => {
      await mutateAsync({
        permission: permission,
        username: state.value.username,
      });
      onClose();
    },
  });

  return (
    <Dialog
      icon={<AddIcon />}
      isOpen
      onClose={onClose}
      title={`Add '${permission}' role`}
      className={clsx({ [Classes.DARK]: isDarkMode })}
    >
      <div className={clsx(Classes.DIALOG_BODY, 'add-permission-body')}>
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
