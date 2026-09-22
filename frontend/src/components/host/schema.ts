import { create, enforce, mode, Modes, test, group, skipWhen, include } from 'vest';

import '../../forms/rules';

import dayjs from '../../dayjs';
import { Regions } from '../../models/Regions';
import { TeamStyles } from '../../models/TeamStyles';

const shape = enforce.shape({
  opens: enforce.isDayjs(),
  address: enforce.isString(),
  ip: enforce.isString(),
  modifiers: enforce.isArrayOf(enforce.isString()),
  scenarios: enforce.isArrayOf(enforce.isString()),
  tags: enforce.isArrayOf(enforce.isString()),
  teams: enforce.isString(),
  size: enforce.isNumber(),
  customStyle: enforce.isString(),
  count: enforce.isNumber(),
  content: enforce.isString(),
  region: enforce.isString(),
  location: enforce.isString(),
  version: enforce.isString(),
  slots: enforce.isNumber(),
  length: enforce.isNumber(),
  mapSize: enforce.isNumber(),
  pvpEnabledAt: enforce.isNumber(),
  hostingName: enforce.isString(),
  tournament: enforce.isBoolean(),
});

export const suite = create(data => {
  mode(Modes.ALL);

  group('opening', () => {
    // TODO matcher for before/after
    test('opens', 'Must be at least 30 minutes in advance', () => data.opens.isAfter(dayjs.utc().add(30, 'minute')));
    test('opens', 'Must be at most 30 days in advance', () => data.opens.isBefore(dayjs.utc().add(30, 'day')));
    test(
      'opens',
      'Minutes must be on exactly xx:00 xx:15 xx:30 or xx:45 in an hour (UTC)',
      () => data.opens.utc().minute() % 15 === 0,
    );
  });

  group('server address/ip', () => {
    include('ip').when('address');
    include('address').when('ip');

    const enforceEitherProvided = () => {
      enforce(data).anyOf(
        enforce.loose({ ip: enforce.isNotEmpty() }),
        enforce.loose({ address: enforce.isNotEmpty() }),
      );
    };

    test('ip', 'Invalid IP supplied, expected format 111.222.333.444[:55555]', () => {
      enforce(data.ip).anyOf(enforce.isEmpty(), enforce.isValidIp());
    });

    test('address', 'Address must be at least 5 chars', () => {
      enforce(data.address).anyOf(enforce.isEmpty(), enforce.isString().minLength(5));
    });

    test('ip', 'Either an IP or an address must be provided (or both)', () => {
      enforceEitherProvided();
    });

    test('address', 'Either an IP or an address must be provided (or both)', () => {
      enforceEitherProvided();
    });
  });

  test('location', 'Must supply a location', () => {
    enforce(data.location).isNotEmpty();
  });
  test('content', 'Must provide some post content', () => {
    enforce(data.content).isNotEmpty();
  });

  test('version', 'Must supply a version', () => {
    enforce(data.version).isNotEmpty();
  });

  test('slots', 'Slots must be at least 2', () => {
    enforce(data.slots).isNumber().greaterThanOrEquals(2);
  });
  test('length', 'Matches must be at least 30 minutes', () => {
    enforce(data.length).isNumber().greaterThanOrEquals(30);
  });
  test('mapSize', 'Map size must be positive', () => {
    enforce(data.mapSize).isNumber().greaterThan(0);
  });
  test('pvpEnabledAt', 'PVP enabled at must be positive', () => {
    enforce(data.pvpEnabledAt).isNumber().greaterThanOrEquals(0);
  });
  test('count', 'Count must be at least 1', () => {
    enforce(data.count).isNumber().greaterThanOrEquals(1);
  });
  test('scenarios', 'Must supply at least 1 scenario', () => {
    enforce(data.scenarios).isArray().minLength(1);
  });
  test('scenarios', 'Must supply at most 25 scenarios', () => {
    enforce(data.scenarios).isArray().maxLength(25);
  });
  test('tags', 'Must supply at most 5 tags', () => {
    enforce(data.tags).isArray().maxLength(5);
  });

  group('team style', () => {
    include('size').when('teams');
    include('customStyle').when('teams');

    const validStyles = TeamStyles.map(t => t.value);

    test('teams', 'Unknown team style', () => {
      enforce(data.teams).inside(validStyles);
    });

    skipWhen(
      () => !TeamStyles.find(t => t.value === data.teams)?.requiresTeamSize,
      () => {
        test('size', 'Invalid value for size', () => {
          enforce(data.size).isNumber().greaterThanOrEquals(0).lessThanOrEquals(32767);
        });
      },
    );

    skipWhen(
      () => data.teams !== 'custom',
      () => {
        test('customStyle', "A custom style must be given when 'custom' is picked", () => {
          enforce(data.customStyle).isNotEmpty();
        });
      },
    );
  });

  test('region', 'Invalid region supplied', () => {
    enforce(data.region)
      .isString()
      .inside(Regions.map(r => r.value));
  });
}, shape);
