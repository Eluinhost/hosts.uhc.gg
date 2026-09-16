import dayjs, { type Dayjs } from '../../dayjs';

export const nextAvailableSlot = (): Dayjs => {
  // set seconds + millis to zero and add 31 minutes to find the next whole minute in 30 minutes time
  const in30 = dayjs.utc().second(0).millisecond(0).add(31, 'minute');

  const targetMinute = in30.minute();
  const diffToNext15 = Math.ceil(targetMinute / 15) * 15 - targetMinute;

  return in30.add(diffToNext15, 'minute');
};
