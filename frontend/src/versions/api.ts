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

export const getAllVersions = async (): Promise<Array<string>> => {
  const versions = await fetchArray<PrismarineJSVersion>({
    url: 'https://raw.githubusercontent.com/PrismarineJS/minecraft-data/refs/heads/master/data/pc/common/protocolVersions.json',
    status: 200,
  });

  const map = versions
    .filter(({ minecraftVersion }) => /^[0-9.]+$/.test(minecraftVersion))
    .reduce(
      (acc, item) => {
        const key = item.usesNetty ? 'netty' : 'prenetty';

        const existing = acc[key].get(item.version);

        acc[key].set(item.version, {
          min: !existing || existing.min.dataVersion > item.dataVersion ? item : existing.min,
          max: !existing || existing.max.dataVersion < item.dataVersion ? item : existing.max,
        });

        return acc;
      },
      { netty: new Map<number, VersionMinMax>(), prenetty: new Map<number, VersionMinMax>() },
    );

  const combined = [
    ...map.netty.values().toArray().sort(compareVersion),
    ...map.prenetty.values().toArray().sort(compareVersion),
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
