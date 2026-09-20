import { enforce } from 'vest';

import dayjs, { type Dayjs } from '../dayjs';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- n4s declares its matchers in a global namespace
  namespace n4s {
    interface EnforceMatchers {
      isDayjs: (value: Dayjs) => value is Dayjs;
      isValidIp: (value: string) => boolean;
      isEmptyString: (value: string) => value is '';
    }
  }
}

const IP_REGEX = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})(?::(\d{1,5}))?$/;

export const isValidIp = (ip: string): boolean => {
  const m = IP_REGEX.exec(ip);
  if (!m) return false;

  const octetsOk = [1, 2, 3, 4].every(i => {
    const octet = Number.parseInt(m[i], 10);
    return octet >= 0 && octet <= 255;
  });

  const portRaw = m[5] as string | undefined;

  const port = portRaw === undefined ? null : Number.parseInt(portRaw, 10);

  return octetsOk && (port === null || (port >= 1 && port <= 65535));
};

// export const isBlank = (v: string | null): v is null | '' => v === null || v === '';
export const isEmptyString = (v: string): v is '' => v === '';

enforce.extend({
  isDayjs: (value: unknown): value is Dayjs => value instanceof dayjs,
  isValidIp,
  isEmptyString,
});
