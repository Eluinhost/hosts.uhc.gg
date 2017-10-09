
import { AlertRule, CreateAlertRuleData } from '../models/AlertRule';
import { always } from 'ramda';
import { authHeaders, callApi, fetchArray, fetchObject } from './util';

export const fetchAllAlertRules = (accessToken: string): Promise<AlertRule[]> => fetchArray<AlertRule>({
  url: `/api/alerts`,
  config: {
    headers: {
      ...authHeaders(accessToken),
      'Content-Type': 'application/json',
    },
  },
});

export const callCreateAlertRule = (rule: CreateAlertRuleData, accessToken: string): Promise<AlertRule> =>
  fetchObject<AlertRule>({
    url: `/api/alerts`,
    config: {
      method: 'POST',
      headers: {
        ...authHeaders(accessToken),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rule),
    },
    status: 201,
  });

export const callDeleteAlertRule = (id: number, accessToken: string): Promise<void> => callApi({
  url: `/api/alerts/${id}`,
  config: {
    method: 'DELETE',
    headers: {
      ...authHeaders(accessToken),
      'Content-Type': 'application/json',
    },
  },
  status: 204,
});
