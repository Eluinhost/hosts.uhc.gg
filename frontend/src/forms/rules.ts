import * as v from 'valibot';

import dayjs, { type Dayjs } from '../dayjs';

const IP_REGEX = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})(?::(\d{1,5}))?$/;

export const ipWithOptionalPort = (message?: string) =>
  v.pipe(
    v.string(),
    v.check((ip: string) => {
      const m = IP_REGEX.exec(ip);
      if (!m) return false;

      const octetsOk = [1, 2, 3, 4].every(i => {
        const octet = Number.parseInt(m[i], 10);
        return octet >= 0 && octet <= 255;
      });

      const portRaw = m[5] as string | undefined;

      const port = portRaw === undefined ? null : Number.parseInt(portRaw, 10);

      return octetsOk && (port === null || (port >= 1 && port <= 65535));
    }, message ?? 'Invalid IP supplied, expected format 111.222.333.444[:55555]'),
  );

export const emptyString = (message?: string) => v.pipe(v.string(), v.empty(message));

export const isDayjs = v.custom<Dayjs>((x): x is Dayjs => dayjs.isDayjs(x));

export const minDate = (min: Dayjs, message: string) => v.check((date: Dayjs) => date.isAfter(min), message);
export const maxDate = (max: Dayjs, message: string) => v.check((date: Dayjs) => date.isBefore(max), message);
