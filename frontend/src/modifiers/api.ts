import { Modifier } from './Modifier';
import { fetchArray } from '../api/util';

export const getAllModifiers = (): Promise<Modifier[]> =>
  fetchArray<Modifier>({
    url: '/api/modifiers',
    status: 200,
  });
