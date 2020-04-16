import { Version } from './Version';
import { fetchArray } from '../api/util';

const compareVersion = (a: Version, b: Version): number => {
  if (a.weight === b.weight) {
    return -a.displayName.localeCompare(b.displayName);
  }

  return b.weight - a.weight;
};

export const getAllVersions = async (): Promise<Version[]> => {
  const versions = await fetchArray<Version>({
    url: '/api/versions/primary',
    status: 200,
  });

  return versions.sort(compareVersion);
};
