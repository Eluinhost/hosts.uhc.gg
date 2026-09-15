import moment from 'moment-timezone';
import { both, flip, gte, lte } from 'ramda';

import type { CreateMatchData } from '../../models/CreateMatchData';
import { TeamStyles } from '../../models/TeamStyles';
import { Validator } from '../../services/Validator';

const asInt = (x: string): number => Number.parseInt(x, 10);
const between = (l: number, r: number) => (a: number) => both(flip(gte)(l), flip(lte)(r))(a);

export const validator: Validator<CreateMatchData> = new Validator<CreateMatchData>()
  .withValidation('count', count => !count || count <= 0, 'Must provide a valid game #')
  .withValidationFunction('opens', opens => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!opens) return 'Must provide an opening time';

    if (opens.get('minute') % 15 !== 0) return 'Must be on 15 minute intervals like xx:15, xx:30 e.t.c.';

    if (opens.isBefore(moment.utc().add(30, 'minutes'))) return 'Must be at least 30 minutes in advance';

    return undefined;
  })
  .withValidationFunction('ip', (ip, obj) => {
    if (!ip) {
      if (!obj.address) {
        return 'IP must be provided if address is not provided';
      }

      return undefined; // allowed to be not provided when address is
    }

    const matches: RegExpMatchArray | null = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})(?::(\d{1,5}))?$/);

    if (!matches) return 'Invalid IP address, expected formatted like 123.123.123.123:12345 or 123.123.123.123';

    const port = matches[5]; // if it exists it will be at index 5

    // ignoring eslint rule - regex says 'string' but the group is optional
    // valid if it doesn't exist, or the port is a number within range
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (port !== undefined && between(1, 65535)(asInt(port))) return 'Port must be 1-65535';

    const validOctets = matches.slice(1, 5).every(octet => {
      const n = asInt(octet);
      return Number.isInteger(n) && n >= 0 && n <= 255;
    });

    if (!validOctets) return 'Segments in an IP must be between 0-255';

    return undefined;
  })
  .withValidationFunction('teams', (teams, obj) => {
    if (!teams) return 'You must select a team style';

    const style = TeamStyles.find(i => i.value === teams);

    if (!style) {
      return 'Invalid team style';
    }

    if (style.requiresTeamSize && (!obj.size || obj.size < 0 || obj.size > 32767)) {
      return 'Must provide a valid team size with this scenario';
    }

    if (style.value === 'custom' && (!obj.customStyle || obj.customStyle.trim().length === 0)) {
      return "Must provide a custom style if 'custom' is selected";
    }

    return undefined;
  })
  .required('region')
  .required('content')
  .required('location')
  .required('mainVersion')
  .required('scenarios')
  .withValidation('slots', slots => !slots || slots <= 1, 'Slots must be at least 2')
  .withValidation('length', length => !length || length < 30, 'Must be at least 30 minutes')
  .withValidation('mapSize', size => !size || size <= 0, 'Must be a positive number')
  .withValidation('pvpEnabledAt', at => !at || at < 0, 'Must be positive')
  .withValidationFunction('address', (address, obj) => {
    if (!address) {
      if (!obj.ip) {
        return 'Address must be provided if an IP is not provided';
      }

      return undefined; // allowed to be not provided when ip is
    }

    return address.length >= 5 ? undefined : 'Address must be at least 5 characters';
  });
