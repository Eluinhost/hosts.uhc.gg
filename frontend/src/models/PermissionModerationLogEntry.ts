import type { Dayjs } from '../dayjs';

export type PermissionModerationLogEntry = {
  readonly id: number;
  readonly modifier: string;
  readonly username: string;
  readonly at: Dayjs;
  readonly permission: string;
  readonly added: boolean;
};
