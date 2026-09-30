import * as v from 'valibot';

import dayjs from '../dayjs';
import { emptyString, ipWithOptionalPort, isDayjs, maxDate, minDate } from '../forms/rules';
import { Regions } from '../models/Regions';
import { TeamStyles } from '../models/TeamStyles';

const badServerAddressAndIp = v.looseObject({
  ip: emptyString(),
  address: emptyString(),
});

const requiredTeamSize = v.looseObject({
  size: v.pipe(
    v.number(),
    v.minValue(0, 'Team size must be at least 0'),
    v.maxValue(32767, 'Team size must be at most 32767'),
  ),
});

const customTeams = v.looseObject({
  customStyle: v.pipe(v.string(), v.nonEmpty('This field is required for custom teams')),
});

const schema = v.pipe(
  v.object({
    opens: v.pipe(
      isDayjs,
      v.check(
        date => date.utc().minute() % 15 === 0,
        'Minutes must be on exactly xx:00 xx:15 xx:30 or xx:45 in an hour (UTC)',
      ),
    ),
    modifiers: v.array(v.pipe(v.string(), v.nonEmpty())),
    scenarios: v.pipe(
      v.array(v.pipe(v.string(), v.nonEmpty())),
      v.minLength(1, 'Must supply at least 1 scenario'),
      v.maxLength(25, 'Must supply at most 25 scenarios'),
    ),
    tags: v.pipe(v.array(v.pipe(v.string(), v.nonEmpty())), v.maxLength(5, 'Must supply at most 5 tags')),
    teams: v.picklist(
      TeamStyles.map(x => x.value),
      'Invalid team style',
    ),
    size: v.number(),
    customStyle: v.string(),
    count: v.pipe(v.number(), v.integer(), v.minValue(1, 'Count must be at least 1')),
    content: v.pipe(v.string(), v.nonEmpty('Must provide some post content')),
    region: v.picklist(
      Regions.map(x => x.value),
      'Invalid region supplied',
    ),
    location: v.pipe(v.string(), v.nonEmpty('Must supply a location')),
    version: v.pipe(v.string(), v.nonEmpty('Must supply a version')),
    slots: v.pipe(v.number(), v.integer(), v.minValue(2, 'Slots must be at least 2')),
    length: v.pipe(v.number(), v.integer(), v.minValue(30, 'Matches must be at least 30 minutes')),
    mapSize: v.pipe(v.number(), v.integer(), v.minValue(1, 'Map size must be positive')),
    pvpEnabledAt: v.pipe(v.number(), v.integer(), v.minValue(1, 'PVP enabled at must be positive')),
    hostingName: v.string(),
    tournament: v.boolean(),
    ip: v.union([emptyString(), ipWithOptionalPort()], 'Invalid IP supplied, expected format 111.222.333.444[:55555]'),
    address: v.union([emptyString(), v.pipe(v.string(), v.minLength(5))], 'Address must be at least 5 chars'),
  }),
  v.rawCheck(({ dataset: { typed, value }, addIssue }) => {
    if (!typed) {
      return;
    }

    if (v.safeParse(badServerAddressAndIp, value).success) {
      addIssue({
        message: 'Either ip or address must be supplied',
        path: [
          {
            type: 'object',
            origin: 'value',
            input: value,
            key: 'ip',
            value: value.ip,
          },
        ],
      });
      addIssue({
        message: 'Either ip or address must be supplied',
        path: [
          {
            type: 'object',
            origin: 'value',
            input: value,
            key: 'address',
            value: value.ip,
          },
        ],
      });
    }

    if (TeamStyles.find(t => t.value === value.teams)?.requiresTeamSize) {
      v.safeParse(requiredTeamSize, value).issues?.forEach(issue => {
        addIssue(issue);
      });
    }

    if (value.teams === 'custom') {
      v.safeParse(customTeams, value).issues?.forEach(issue => {
        addIssue(issue);
      });
    }
  }),
);

export const withOpeningTimeValidation = () =>
  v.intersect([
    schema,
    v.object({
      opens: v.pipe(
        isDayjs,
        minDate(dayjs.utc().add(30, 'minute'), 'Must be at least 30m in advance'),
        maxDate(dayjs.utc().add(30, 'day'), 'Must be at most 30 days in advance'),
      ),
    }),
  ]);
