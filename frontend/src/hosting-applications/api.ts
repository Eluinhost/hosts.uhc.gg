import { authHeaders, callApi, fetchArray, fetchObject } from '../api/util';
import { HostApplication, HostApplicationDetails, SubmitAnswerData } from '../models/HostApplication';

export const fetchHostApplications = (): Promise<HostApplication[]> =>
  fetchArray<HostApplication>({
    url: '/api/host-applications',
  });

export const fetchHostApplicationDetails = (id: number, accessToken: string): Promise<HostApplicationDetails> =>
  fetchObject<HostApplicationDetails>({
    url: `/api/host-applications/${id}`,
    config: {
      headers: authHeaders(accessToken),
    },
  });

export const createHostApplication = (answers: SubmitAnswerData[], accessToken: string): Promise<void> =>
  callApi({
    url: '/api/host-applications',
    config: {
      method: 'POST',
      headers: {
        ...authHeaders(accessToken),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ answers }),
    },
    status: 201,
  });

export const reviewHostApplication = (
  id: number,
  decision: 'approve' | 'decline',
  accessToken: string,
  reason?: string,
): Promise<void> =>
  callApi({
    url: `/api/host-applications/${id}/${decision}`,
    config: {
      method: 'POST',
      headers: {
        ...authHeaders(accessToken),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    },
  });
