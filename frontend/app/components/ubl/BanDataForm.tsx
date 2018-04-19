import * as React from 'react';
import { FormProps, reduxForm, StrictFormProps, SubmissionError } from 'redux-form';
import { ApplicationState } from '../../state/ApplicationState';
import * as moment from 'moment-timezone';
import { TextField } from '../fields/TextField';
import { DateTimeField } from '../fields/DateTimeField';
import { If } from '../If';
import { Button, Intent } from '@blueprintjs/core';
import { isUuid } from '../../services/isUuid';
import { ApiErrors } from '../../api';
import { ReactDatePickerProps } from 'react-datepicker';
import { Validator } from '../../services/Validator';

export type BanDataFormProps = {
  readonly onSubmit: (values: BanData) => Promise<void>;
};

export type BanData = {
  ign: string;
  uuid: string;
  reason: string;
  expires: moment.Moment;
  link: string;
};

const earliest = moment
  .utc()
  .set('hour', 0)
  .set('minute', 0)
  .set('second', 0)
  .add(1, 'day');

const dateProps: Partial<ReactDatePickerProps> = {
  minDate: earliest,
  fixedHeight: true,
  isClearable: false,
  monthsShown: 2,
};

export const BanDataFormComponent: React.SFC<StrictFormProps<BanData, {}, ApplicationState> & BanDataFormProps> = ({
  handleSubmit,
  submitting,
  valid,
  error,
}) => (
  <form onSubmit={handleSubmit}>
    <DateTimeField
      name="expires"
      label="Ban Expires"
      required
      disabled={submitting}
      disableTime
      datePickerProps={dateProps}
    />
    <TextField name="ign" label="IGN" disabled={submitting} required />
    <TextField name="uuid" label="UUID" disabled={submitting} required />
    <TextField name="reason" label="Reason for ban" disabled={submitting} required />
    <TextField name="link" label="Case Link" disabled={submitting} required />

    <If condition={!!error}>
      <div className="pt-callout pt-intent-danger">
        <h5>{error}</h5>
      </div>
    </If>

    <div>
      <Button
        type="submit"
        disabled={!valid}
        iconName="take-action"
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
  .withValidation('expires', expires => !expires || !expires.isValid(), 'A valid date must be supplied');

export const BanDataForm: React.SFC<
  FormProps<BanData, BanDataFormProps, ApplicationState> & BanDataFormProps
> = reduxForm<BanData, BanDataFormProps>({
  form: 'ban-data-form',
  initialValues: {
    expires: earliest,
  },
  validate: validator.validate,
  onSubmit: (values, dispatch, props) =>
    props.onSubmit(values).catch(err => {
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
