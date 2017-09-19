import * as moment from 'moment-timezone';

export type BanEntry = {
  readonly id: number;
  readonly ign: string;
  readonly uuid: string;
  readonly reason: string;
  readonly created: moment.Moment;
  readonly expires: moment.Moment;
  readonly link: string;
  readonly createdBy: string;
};
