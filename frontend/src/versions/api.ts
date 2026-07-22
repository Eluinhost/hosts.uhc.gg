import { fetchArray } from '../api/util';

const compareVersion = (a: PrismarineJSVersion, b: PrismarineJSVersion): number => {
  return b.version - a.version;
};

interface PrismarineJSVersion {
  minecraftVersion: string;
  version: number;
}

export const getAllVersions = async (): Promise<Array<string>> => {
  const versions = await fetchArray<PrismarineJSVersion>({
    url:
      'https://raw.githubusercontent.com/PrismarineJS/minecraft-data/refs/heads/master/data/pc/common/protocolVersions.json',
    status: 200,
  });

  return [
    ...Object.values(
      versions
        .filter(({ minecraftVersion }) => /^[0-9.]+$/.test(minecraftVersion))
        .reduce(
          (acc, item) => ({
            ...acc,
            [item.version]: acc[item.version] ?? item,
          }),
          {} as Record<number, PrismarineJSVersion>,
        ),
    )
      .sort(compareVersion)
      .map(({ minecraftVersion }) => minecraftVersion),
    'Other (specify in range)',
  ];
};
