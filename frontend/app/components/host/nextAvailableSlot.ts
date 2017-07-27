import * as moment from 'moment';

export const nextAvailableSlot = (): moment.Moment => {
  const in30 = moment.utc().add(30, 'minute');

  const targetMinute = in30.get('minute');
  const diffToNext15 = (Math.ceil(targetMinute / 15) * 15) - targetMinute;

  return in30.add(diffToNext15, 'minute');
};
