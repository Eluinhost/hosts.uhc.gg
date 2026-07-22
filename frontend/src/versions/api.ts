import { fetchObject } from '../api/util';

const compareVersion = (a: MojangAPIVersion, b: MojangAPIVersion): number => {
  return b.releaseTime.localeCompare(a.releaseTime);
};

interface MojangAPIVersion {
  id: string;
  type: string;
  releaseTime: string;
}

interface MojangAPIVersions {
  versions: Array<MojangAPIVersion>;
}

export const getAllVersions = async (): Promise<Array<string>> => {
  const versions = await fetchObject<MojangAPIVersions>({
    url: 'https://piston-meta.mojang.com/mc/game/version_manifest_v2.json',
    status: 200,
  });

  return [
    ...versions.versions
      .filter(x => x.type === 'release')
      .sort(compareVersion)
      .map(({ id }) => id),
    'Other (specify in range)',
  ];
};
