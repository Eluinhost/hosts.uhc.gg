import moment from 'moment-timezone';

export type AlertRule = {
  id: number;
  field: AlertRuleField;
  alertOn: string;
  exact: boolean;
  createdBy: string;
  created: moment.Moment;
};

export type AlertRuleField = 'ip' | 'address' | 'hosting name' | 'content' | 'tags';

export const AlertRuleFields: AlertRuleField[] = ['ip', 'address', 'hosting name', 'content', 'tags'];

export type CreateAlertRuleData = {
  readonly field: AlertRuleField;
  readonly alertOn: string;
  readonly exact: boolean;
};
