import type { Dayjs } from '../dayjs';

export type CreateMatchData = {
  opens: Dayjs;
  address: string;
  ip: string;
  modifiers: string[];
  scenarios: string[];
  tags: string[];
  teams: string;
  size: number;
  customStyle: string;
  count: number;
  content: string;
  region: string;
  location: string;
  version: string;
  slots: number;
  length: number;
  mapSize: number;
  pvpEnabledAt: number;
  hostingName: string;
  tournament: boolean;
};
