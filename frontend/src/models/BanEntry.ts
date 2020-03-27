import * as moment from 'moment';

export type BanEntry = {
  readonly id: number;
  readonly ign: string;
  readonly uuid: string;
  readonly reason: string;
  readonly created: moment.Moment;
  readonly expires: moment.Moment | null;
  readonly link: string;
  readonly createdBy: string;
};
