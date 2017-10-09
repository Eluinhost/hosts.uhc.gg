
import { Obj } from 'ramda';
import { BanEntry } from '../BanEntry';
import { BanData } from '../components/ubl/BanDataForm';
import { authHeaders, callApi, fetchArray, fetchObject } from './util';

export const searchBannedUsernames = (query: string): Promise<Obj<string[]>> => fetchObject<Obj<string[]>>({
  url: `/api/ubl/search/${query}`,
  config: {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  },
});

export const fetchAllBansForUuid = (uuid: string): Promise<BanEntry[]> => fetchArray<BanEntry>({
  url: `/api/ubl/${uuid}`,
  momentProps: ['expires', 'created'],
});

export const fetchAllCurrentBans = (): Promise<BanEntry[]> => fetchArray<BanEntry>({
  url: `/api/ubl/current`,
  momentProps: ['expires', 'created'],
});

export const callDeleteBan = (id: number, accessToken: string): Promise<void> => callApi({
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

export const callCreateBan = (data: BanData, accessToken: string): Promise<void> => callApi({
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

export const callEditBan = (id: number, data: BanData, accessToken: string): Promise<void> => callApi({
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
