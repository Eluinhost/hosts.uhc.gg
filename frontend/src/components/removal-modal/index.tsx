import { Button, Classes, ControlGroup, Dialog, H5, Intent } from '@blueprintjs/core';
import { ArrowLeftIcon, DeleteIcon, TickIcon, WarningSignIcon } from '@blueprintjs/icons';
import { useMutation } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import React, { createElement } from 'react';
import { useDispatch } from 'react-redux';
import { enforce, test, create } from 'vest';

import { FetchMatchDetails, UpdateUpcoming } from '../../actions';
import { ApiErrors, MatchesApi } from '../../api';
import { accessTokenAtom } from '../../atoms/authentication';
import { isDarkModeAtom } from '../../atoms/isDarkMode';
import { FormLabel } from '../../forms/FormLabel';
import { useAppForm } from '../../forms/useAppForm';
import { showToast } from '../../services/AppToaster';

const schema = enforce.shape({
  reason: enforce.isString(),
});

export const suite = create(data => {
  test('reason', 'This field is required', () => {
    enforce(data.reason).isString().min(1);
  });
  test('reason', 'Must be at least 3 characters long', () => {
    enforce(data.reason).isString().min(3);
  });
  test('reason', 'Must be at most 256 characters long', () => {
    enforce(data.reason).isString().max(256);
  });
}, schema);

export const RemovalModal: React.FC<{ id: number; onClose: () => void }> = ({ id, onClose }) => {
  const isDarkMode = useAtomValue(isDarkModeAtom);
  const accessToken = useAtomValue(accessTokenAtom);
  const dispatch = useDispatch();

  const { mutateAsync } = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      MatchesApi.callRemove(id, reason, accessToken ?? 'NO ACCESS TOKEN'),
  });

  const form = useAppForm({
    defaultValues: { reason: '' },
    validators: [
      {
        run: suite,
        triggers: ['change'],
      },
    ],
    onSubmit: async ({ value, createValidationError }) => {
      console.log('Submitting removal form with reason:', value.reason);
      try {
        await mutateAsync({ id, reason: value.reason });
        await showToast({
          intent: Intent.SUCCESS,
          icon: createElement(TickIcon),
          message: `Removed match #${id}`,
        });

        onClose();

        // TODO replace later with tanstack query cache invalidation when they're not longer in redux + sagas
        dispatch(UpdateUpcoming.start());
        dispatch(FetchMatchDetails.start({ id }));
      } catch (err) {
        const message = err instanceof ApiErrors.BadDataError ? err.message : `Failed to remove match #${id}`;

        await showToast({
          intent: Intent.DANGER,
          icon: createElement(WarningSignIcon),
          message,
        });

        return createValidationError(message);
      }
    },
  });

  return (
    <Dialog
      icon={<DeleteIcon />}
      isOpen
      onClose={onClose}
      title="Remove match"
      className={isDarkMode ? Classes.DARK : ''}
    >
      <div className={`${Classes.DIALOG_BODY} remove-modal-body`}>
        <form
          onSubmit={e => {
            e.preventDefault();
            void form.handleSubmit();
          }}
        >
          <form.Field name="reason">
            {field => (
              <ControlGroup fill>
                <FormLabel field={field} label="Reason" showRequiredStar>
                  <field.TextField field={field} />
                </FormLabel>
              </ControlGroup>
            )}
          </form.Field>
          <H5>This cannot be undone once confirmed</H5>
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
                intent={Intent.DANGER}
                type="submit"
                onClick={() => {
                  void form.handleSubmit();
                }}
                disabled={!canSubmit}
                icon={<DeleteIcon />}
              >
                Confirm Removal
              </Button>
            )}
          </form.Subscribe>
        </div>
      </div>
    </Dialog>
  );
};
