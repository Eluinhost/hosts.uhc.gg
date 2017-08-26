import * as React from 'react';
import { FormProps, reduxForm, StrictFormProps, SubmissionError } from 'redux-form';
import { ApplicationState } from '../../state/ApplicationState';
import * as moment from 'moment';
import { TextField } from '../fields/TextField';
import { DateTimeField } from '../fields/DateTimeField';
import { If } from '../If';
import { Button, Intent } from '@blueprintjs/core';
import { Spec, validate } from '../../validate';
import { uuidRegex } from '../../uuidRegex';
import { BadDataError, createBan, ForbiddenError, NotAuthenticatedError } from '../../api/index';
import * as H from 'history';
import {ReactDatePickerProps} from "react-datepicker";

export type CreateBanFormProps = {
  readonly accessToken: string;
  readonly history: H.History;
};

export type CreateBanData = {
  ign: string;
  uuid: string;
  reason: string;
  expires: moment.Moment;
  link: string;
};

const earliest = moment().set('hour', 0).set('minute', 0).set('second', 0).add(1, 'day');

const dateProps: Partial<ReactDatePickerProps> = {
  minDate: earliest,
  fixedHeight: true,
  isClearable: false,
  monthsShown: 2,
};

export const CreateBanFormComponent: React.SFC<
  & StrictFormProps<CreateBanData, {}, ApplicationState>
  & CreateBanFormProps
> = ({ handleSubmit, submitting, valid, error }) => (
  <form onSubmit={handleSubmit}>
    <DateTimeField
      name="expires"
      label="Ban Ends"
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
      <div className="pt-callout pt-intent-danger"><h5>{error}</h5></div>
    </If>

    <div>
      <Button
        type="submit"
        disabled={!valid}
        iconName="take-action"
        loading={submitting}
        intent={valid ? Intent.SUCCESS : Intent.WARNING}
      >
        {submitting ? 'Banning...' : 'Ban User'}
      </Button>
    </div>
  </form>
);

const minLength3 = (value: string) =>
  value && value.length >= 3
    ? undefined
    : 'Must be at least 3 characters';

const isUuid = (value: string) =>
  uuidRegex.test(value)
    ? undefined
    : 'Must be a UUID (00000000-0000-0000-0000-000000000000)';

const validation: Spec<CreateBanData> = {
  ign: minLength3,
  uuid: isUuid,
  reason: minLength3,
  link: minLength3,
  expires: (v: moment.Moment) => v && v.isValid()
    ? undefined
    : 'A valid date must be supplied',
};

export const CreateBanForm: React.SFC<
  & FormProps<CreateBanData, CreateBanFormProps, ApplicationState>
  & CreateBanFormProps
> = reduxForm<CreateBanData, CreateBanFormProps>({
  form: 'create-ban-form',
  initialValues: {
    expires: earliest,
  },
  validate: validate(validation),
  onSubmit: (values, _, props) =>
    createBan(values, props.accessToken)
      .then(() => {
        // if success send them to the current bans page to view it
        props.history.push('/ubl');
      })
      .catch((err) => {
        if (err instanceof BadDataError)
          throw new SubmissionError({ _error: `Bad data: ${err.message}` });

        if (err instanceof NotAuthenticatedError) {
          // User cookie has expired, get them to reauthenticate
          window.location.href = '/authenticate?path=/host';
          return;
        }

        if (err instanceof ForbiddenError)
          throw new SubmissionError({ _error: 'You no longer have permission to ban' });

        throw new SubmissionError({ _error: 'Unexpected server issue, please contact an admin if this persists' });
      }),
})(CreateBanFormComponent);
