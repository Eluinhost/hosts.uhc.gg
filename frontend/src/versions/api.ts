import { fetchArray } from '../api/util';

const compareVersion = (a: VersionMinMax, b: VersionMinMax): number => {
  return b.min.dataVersion - a.min.dataVersion;
};

interface PrismarineJSVersion {
  minecraftVersion: string;
  dataVersion: number;
  version: number;
  usesNetty: boolean;
}

interface VersionMinMax {
  min: PrismarineJSVersion;
  max: PrismarineJSVersion;
}

interface VersionMap {
  netty: Record<number, VersionMinMax>;
  prenetty: Record<number, VersionMinMax>;
}

export const getAllVersions = async (): Promise<Array<string>> => {
  const versions = await fetchArray<PrismarineJSVersion>({
    url:
      'https://raw.githubusercontent.com/PrismarineJS/minecraft-data/refs/heads/master/data/pc/common/protocolVersions.json',
    status: 200,
  });

  const map = versions
    .filter(({ minecraftVersion }) => /^[0-9.]+$/.test(minecraftVersion))
    .reduce(
      (acc, item) => {
        const key = item.usesNetty ? 'netty' : 'prenetty';

        return {
          ...acc,
          [key]: {
            ...acc[key],
            [item.version]: {
              min:
                !acc[key][item.version]?.min || acc[key][item.version].min.dataVersion > item.dataVersion
                  ? item
                  : acc[key][item.version].min,
              max:
                !acc[key][item.version]?.max || acc[key][item.version].max.dataVersion < item.dataVersion
                  ? item
                  : acc[key][item.version].max,
            },
          },
        };
      },
      { netty: {}, prenetty: {} } as VersionMap,
    );

  const combined = [
    ...Object.values(map.netty).sort(compareVersion),
    ...Object.values(map.prenetty).sort(compareVersion),
  ];

  return [
    ...combined.map(({ min, max }) =>
      min.minecraftVersion === max.minecraftVersion
        ? min.minecraftVersion
        : `${min.minecraftVersion} - ${max.minecraftVersion}`,
    ),
    'Other (specify in range)',
  ];
};
