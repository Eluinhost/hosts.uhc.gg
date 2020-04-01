import moment from 'moment-timezone';

export const nextAvailableSlot = (): moment.Moment => {
  // set seconds + millis to zero and add 31 minutes to find the next whole minute in 30 minutes time
  const in30 = moment.utc().seconds(0).milliseconds(0).add(31, 'minute');

  const targetMinute = in30.get('minute');
  const diffToNext15 = Math.ceil(targetMinute / 15) * 15 - targetMinute;

  return in30.add(diffToNext15, 'minute');
};
