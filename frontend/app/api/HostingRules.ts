import { HostingRules } from '../state/HostingRulesState';
import { authHeaders, callApi, fetchObject } from './util';

export const fetchHostingRules = (): Promise<HostingRules> =>
  fetchObject<HostingRules>({
    url: `/api/rules`,
    momentProps: ['modified'],
  });

export const callSetHostingRules = (content: string, accessToken: string): Promise<void> =>
  callApi({
    url: `/api/rules`,
    status: 201,
    config: {
      method: 'POST',
      headers: {
        ...authHeaders(accessToken),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(content),
    },
  });
