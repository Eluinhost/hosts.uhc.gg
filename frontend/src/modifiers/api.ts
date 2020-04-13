import { Modifier } from './Modifier';
import { authHeaders, callApi, fetchArray, fetchObject } from '../api/util';

export const getAllModifiers = (): Promise<Modifier[]> =>
  fetchArray<Modifier>({
    url: '/api/modifiers',
    status: 200,
  });

export const deleteModifier = (id: number, accessToken: string): Promise<void> =>
  callApi({
    url: `/api/modifiers/${id}`,
    config: {
      method: 'DELETE',
      headers: authHeaders(accessToken),
    },
    status: 204,
  });

export const createModifier = (name: string, accessToken: string): Promise<Modifier> =>
  fetchObject<Modifier>({
    url: '/api/modifiers',
    config: {
      method: 'POST',
      headers: {
        ...authHeaders(accessToken),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(name),
    },
    status: 201,
  });
