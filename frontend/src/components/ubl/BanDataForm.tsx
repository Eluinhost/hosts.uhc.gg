import * as React from 'react';
import {
  ConfigProps,
  InjectedFormProps,
  reduxForm,
  SubmissionError
} from "redux-form";
import moment from 'moment-timezone';
import { TextField } from '../fields/TextField';
import { DateTimeField } from '../fields/DateTimeField';
import { Button, Callout, H5, Intent } from "@blueprintjs/core";
import { isUuid } from '../../services/isUuid';
import { ApiErrors } from '../../api';
import { Validator } from '../../services/Validator';

export type BanDataFormProps = {
  readonly submitBan: (values: BanData) => Promise<void>;
};

export type BanData = {
  ign: string;
  uuid: string;
  reason: string;
  starts: moment.Moment;
  expires: moment.Moment | null;
  link: string;
};

const today = moment.utc()
  .set('hour', 0)
  .set('minute', 0)
  .set('second', 0)
  .set('millisecond', 0);

const earliest = today.clone().add(1, 'day');

const ClearButton: React.FunctionComponent<{ value: any, onClear: () => void }> = ({ value, onClear }) => (
  <Button className="ban-expiry-input_clear-button" intent={value ? Intent.NONE : Intent.DANGER} text="Permanent" onClick={onClear} />
);

export const BanDataFormComponent: React.FunctionComponent<InjectedFormProps<BanData, BanDataFormProps> & BanDataFormProps> = ({
  handleSubmit,
  submitting,
  valid,
  error,
}) => (
  <form onSubmit={handleSubmit}>
    <DateTimeField
      name="starts"
      label="Ban Starts"
      required
      disabled={submitting}
      disableTime
      datePickerProps={{ fixedHeight: true }}
    />
    <DateTimeField
      name="expires"
      label="Ban Expires"
      required={false}
      disabled={submitting}
      disableTime
      datePickerProps={{ fixedHeight: true, calendarClassName: 'ban-expiry-input' }}
      renderClearButton={ClearButton}
    />
    <TextField name="ign" label="IGN" disabled={submitting} required />
    <TextField name="uuid" label="UUID" disabled={submitting} required />
    <TextField name="reason" label="Reason for ban" disabled={submitting} required />
    <TextField name="link" label="Case Link" disabled={submitting} required />

    {!!error && (
      <Callout intent={Intent.DANGER}>
        <H5>{error}</H5>
      </Callout>
    )}

    <div>
      <Button
        type="submit"
        disabled={!valid}
        icon="take-action"
        loading={submitting}
        intent={valid ? Intent.SUCCESS : Intent.WARNING}
      >
        Submit Ban
      </Button>
    </div>
  </form>
);

const validator = new Validator<BanData>()
  .withValidation('uuid', uuid => !isUuid(uuid), 'Must be a UUID (00000000-0000-0000-0000-000000000000)')
  .required('ign')
  .required('reason')
  .required('link')
  .withValidationFunction('expires', (expires, data) => {
    // no expiry is fine
    if (!expires) {
      return undefined;
    }

    if (!expires.isValid()) {
      return 'A valid date must be supplied';
    }

    if (!expires.isAfter(data.starts)) {
      return 'Must be after start date';
    }

    return undefined;
  })
  .withValidation('starts', starts => !starts || !starts.isValid(), 'A valid date must be supplied');

export const BanDataForm: React.ComponentType<BanDataFormProps & Partial<ConfigProps<BanData, BanDataFormProps>>> = reduxForm<BanData, BanDataFormProps>({
  form: 'ban-data-form',
  initialValues: {
    starts: today,
    expires: earliest,
  },
  validate: validator.validate,
  onSubmit: (values: BanData, dispatch, props) =>
    props.submitBan(values).catch(err => {
      if (err instanceof ApiErrors.BadDataError) throw new SubmissionError({ _error: `Bad data: ${err.message}` });

      if (err instanceof ApiErrors.NotAuthenticatedError) {
        // User cookie has expired, get them to reauthenticate
        window.location.href = '/authenticate?path=/host';
        return;
      }

      if (err instanceof ApiErrors.ForbiddenError)
        throw new SubmissionError({ _error: 'You no longer have permission to ban' });

      throw new SubmissionError({ _error: 'Unexpected server issue, please contact an admin if this persists' });
    }),
})(BanDataFormComponent);
