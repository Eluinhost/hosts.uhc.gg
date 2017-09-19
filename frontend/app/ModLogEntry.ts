import * as moment from 'moment-timezone';

export type ModLogEntry = {
  readonly id: number;
  readonly modifier: string;
  readonly username: string;
  readonly at: moment.Moment;
  readonly permission: string;
  readonly added: boolean;
};
