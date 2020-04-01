import { BanEntry } from '../models/BanEntry';
import { BanData } from '../components/ubl/BanDataForm';
import { authHeaders, callApi, fetchArray, fetchObject } from './util';
import moment from 'moment';

export const searchBannedUsernames = (query: string): Promise<{ [key: string]: string[] }> =>
  fetchObject<{ [key: string]: string[] }>({
    url: `/api/ubl/search/${query}`,
    config: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  });

export const fetchAllBansForUuid = (uuid: string): Promise<BanEntry[]> =>
  fetchArray<BanEntry>({
    url: `/api/ubl/${uuid}`,
  }).then(entries =>
    entries.map(entry => ({
      ...entry,
      expires: entry.expires && moment.utc(entry.expires),
      created: moment.utc(entry.created),
    })),
  );

export const fetchAllCurrentBans = (): Promise<BanEntry[]> =>
  fetchArray<BanEntry>({
    url: `/api/ubl/current`,
  }).then(entries =>
    entries.map(entry => ({
      ...entry,
      expires: entry.expires && moment.utc(entry.expires),
      created: moment.utc(entry.created),
    })),
  );

export const callDeleteBan = (id: number, accessToken: string): Promise<void> =>
  callApi({
    url: `/api/ubl/${id}`,
    config: {
      method: 'DELETE',
      headers: {
        ...authHeaders(accessToken),
        'Content-Type': 'application/json',
      },
    },
    status: 204,
  });

export const callCreateBan = (data: BanData, accessToken: string): Promise<void> =>
  callApi({
    url: `/api/ubl`,
    config: {
      method: 'POST',
      headers: {
        ...authHeaders(accessToken),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    },
    status: 201,
  });

export const callEditBan = (id: number, data: BanData, accessToken: string): Promise<void> =>
  callApi({
    url: `/api/ubl/${id}`,
    config: {
      method: 'POST',
      headers: {
        ...authHeaders(accessToken),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    },
  });
