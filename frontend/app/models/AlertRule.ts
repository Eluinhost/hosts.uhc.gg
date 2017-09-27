import * as moment from 'moment';

export type AlertRule = {
  id: number;
  field: AlertRuleField;
  alertOn: string;
  exact: boolean;
  createdBy: string;
  created: moment.Moment
};

export type AlertRuleField = 'ip' | 'address' | 'hosting name' | 'content' | 'tags';

export const AlertRuleFields: AlertRuleField[] = ['ip', 'address', 'hosting name', 'content', 'tags'];
