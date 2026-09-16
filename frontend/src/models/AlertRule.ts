import type { Dayjs } from '../dayjs';

export type AlertRule = {
  id: number;
  field: AlertRuleField;
  alertOn: string;
  exact: boolean;
  createdBy: string;
  created: Dayjs;
};

export type AlertRuleField = 'ip' | 'address' | 'hosting name' | 'content' | 'tags';

export const AlertRuleFields: AlertRuleField[] = ['ip', 'address', 'hosting name', 'content', 'tags'];

export type CreateAlertRuleData = {
  readonly field: AlertRuleField;
  readonly alertOn: string;
  readonly exact: boolean;
};
