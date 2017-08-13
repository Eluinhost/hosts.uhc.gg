import { Spec } from '../../validate';
import * as moment from 'moment';
import { TeamStyles } from '../../TeamStyles';
import { CreateMatchData } from '../../api/index';
import {
  propEq,
  find,
  propSatisfies,
  curry,
  CurriedFunction2,
  all,
  map,
  take,
  pipe,
  drop,
  view,
  lensIndex,
  ifElse,
  T,
  both,
  flip,
  gte,
  lte,
  cond,
  complement,
  always,
} from 'ramda';
import { Match } from '../../Match';
import { isUndefined } from 'util';
import { ApplicationState } from '../../state/ApplicationState';
import { Dispatch } from 'redux';
import { CreateMatchFormProps } from './CreateMatchForm';

export const validation: Spec<CreateMatchData> = {
  count: count => !count || count < 0 ? 'Must provide a valid game #' : undefined,
  opens: (opens) => {
    if (!opens)
      return 'Must provide an opening time';

    if (opens.get('minute') % 15 !== 0)
      return 'Must be on 15 minute intervals like xx:15, xx:30 e.t.c.';

    if (opens.isBefore(moment.utc().add(30, 'minutes')))
      return 'Must be at least 30 minutes in advance';

    return undefined;
  },
  ip: (ip) => {
    if (!ip)
      return 'A direct IP address is required';

    const matches: RegExpMatchArray | null =
      ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})(?::(\d{1,5}))?$/);

    const asInt = (x: string): number => Number.parseInt(x, 10);
    const between = (l: number, r: number) => (a: number) => both(flip(gte)(l), flip(lte)(r))(a);

    const validMatches = (matches: string[] | null): boolean => matches !== null;

    const validPort = (matches: string[]): boolean => pipe(
      view(lensIndex(5)), // if it exists it will be at index 5
      // it is valid if it doesn't exist or if the port is a number and within the range
      ifElse(
        isUndefined,
        T,
        pipe(
          asInt,
          between(1, 65535),
        ),
      ),
    )(matches);

    const validOctets = (matches: string[]): boolean => pipe(
      drop(1), // skip full match from regex
      take(4), // just the 4 octet matches
      map(asInt), // convert to numbers
      all(between(0, 255)), // make sure valid octet
    )(matches);

    return cond([
      [
        complement(validMatches),
        always('Invalid IP address, expected formatted like 123.123.123.123:12345 or 123.123.123.123'),
      ],
      [complement(validPort), always('Port must be 1-65535')],
      [complement(validOctets), always('Segments in an IP must be between 0-255')],
      [T, always(undefined)],
    ])(matches);
  },
  region: region => region ? undefined : 'You must select a region',
  teams: (teams, obj) => {
    if (!teams)
      return 'You must select a team style';

    const style = TeamStyles.find(i => i.value === teams);

    if (style!.requiresTeamSize && (!obj.size || obj.size < 1 || obj.size > 32767))
      return 'Must provide a valid team size with this scenario';

    if (style!.value === 'custom' && !obj.customStyle)
      return 'Must provide a custom style if \'custom\' is selected';

    return undefined;
  },
  content: content => content ? undefined : 'Must provide some content for the post',
  scenarios: scenarios => scenarios && scenarios.length ? undefined : 'Must provide at least 1 scenario',
  location: location => location ? undefined : 'Must provide a location',
  version: version => version && version.length ? undefined :  'Must provide a version',
  slots: slots => slots && slots > 1 ? undefined : 'Slots must be at least 2',
  length: length => length && length >= 30 ? undefined : 'Must be at least 30 minutes',
  mapSize: mapSize => mapSize && mapSize > 0 ? undefined : 'Must be positive',
  pvpEnabledAt: pvpEnabledAt => pvpEnabledAt && pvpEnabledAt >= 0 ? undefined : 'Must be positive',
  address: always(undefined),
  tags: always(undefined),
  size: always(undefined),
  customStyle: always(undefined),
  hostingName: always(undefined),
  tournament: always(undefined),
};

const isSameTime: CurriedFunction2<moment.Moment, moment.Moment, boolean> =
  curry((a: moment.Moment, b: moment.Moment) => a.isSame(b));

const findExactConflict: CurriedFunction2<moment.Moment, Match[], Match | undefined> =
  curry((a: moment.Moment, b: Match[]) => find<Match>(
    both(
      propEq('tournament', false), // can only conflict if not a tournament
      propSatisfies(isSameTime(a), 'opens'),
    ),
    b,
  ));

export const asyncValidation = async (
  values: CreateMatchData,
  dispatch: Dispatch<ApplicationState>,
  props: CreateMatchFormProps,
): Promise<void> => {
  const conflicts = await props.recheckConflicts(values.region, values.opens);

  const conflict = findExactConflict(values.opens, conflicts);

  // Tournaments bypass overhost protection
  if (!values.tournament && conflict) {
    // tslint:disable-next-line:max-line-length
    const message = `Conflicts with /u/${conflict.author}'s #${conflict.count} (${conflict.region} - ${conflict.opens.format('HH:mm')})`;

    return Promise.reject({
      opens: message,
      region: message,
    });
  }
};
