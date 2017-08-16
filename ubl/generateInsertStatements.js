const {join, pipe, map, concat, filter} = require('ramda');
const moment = require('moment');
const fs = require('fs');

const old = require('./data/old');
const current = require('./data/current');

const parseDate = dateString => {
  const parsed = moment.utc(
    dateString
      .replace('Apil', 'April')
      .replace('Fabruary', 'February')
      .replace('September 31', 'October 1')
      .replace('June 31', 'July 1')
      .replace('November 31', 'December 1')
      .replace(' ', ''), // fix spacing issues by removing them all
    'MMMMD,YYYY'
  );

  if (!parsed.isValid())
    throw new Error(`invalid date: ${dateString}`);

  return parsed.toISOString();
};

const uuidRegex = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/

const parseUuid = uuid => {
  let toParse = uuid.trim();

  if (toParse === 'Couldnt do...?')
    return '00000000-0000-0000-0000-000000000000';

  switch (toParse.length) {
    case 32:
      toParse =
        toParse.substring(0, 8) + '-' +
        toParse.substring(8, 12) + '-' +
        toParse.substring(12, 16) + '-' +
        toParse.substring(16, 20) + '-' +
        toParse.substring(20, 32);
      break;
    case 36:
      break;
    default:
      throw new Error(`invalid uuid length (${uuid.length}): ${uuid}`);
  }

  if (!uuidRegex.test(toParse))
    throw new Error(`invalid uuid: ${uuid}`);

  return toParse;
};

const parseCurrentItem = item => {
  try {
    return {
      created: parseDate(item.datebanned.__text),
      expires: parseDate(item.expirydate.__text),
      ign: item.ign.__text,
      uuid: parseUuid(item.uuid.__text),
      reason: item.reason.__text,
      link: item.case.__text
    };
  } catch (err) {
    throw new Error(`Failed to parse record ${JSON.stringify(item)} : ${err}`);
  }
};

const parseOldItem = item => {
  try {
    return {
      created: parseDate(item.bandate.__text),
      expires: parseDate(item.unbandate.__text),
      ign: item.player.__text,
      uuid: parseUuid(item.uuid.__text),
      reason: item.reason.__text,
      link: item._ckd7g ? item._ckd7g.__text : 'Unknown'
    };
  } catch (err) {
    throw new Error(`Failed to parse record ${JSON.stringify(item)} : ${err}`);
  }
}

const generateStatement = item => `INSERT INTO ubl (ign, uuid, reason, created, expires, link) VALUES (
    '${item.ign.replace(/'/g, '\'\'')}',
    '${item.uuid}',
    '${item.reason.replace(/'/g, '\'\'')}',
    '${item.created}',
    '${item.expires}',
    '${item.link.replace(/'/g, '\'\'')}'
)`;

const createOutputFile = pipe(
  map(generateStatement),
  statements => [
    'BEGIN TRANSACTION',
    'TRUNCATE TABLE ubl',
    ...statements,
    'COMMIT TRANSACTION'
  ],
  join(';\n'),
  data => fs.writeFileSync('output.sql', data, {encoding: 'utf-8'})
);

const parsedData = concat(
  map(parseCurrentItem)(current.feed.entry),
  map(parseOldItem)(old.feed.entry)
);

const withoutInvalidUuids = filter(
  item => {
    if (item.uuid === '00000000-0000-0000-0000-000000000000') {
      console.log(`Skipping entry due to invalid UUID: ${JSON.stringify(item)}`)
      return false;
    }
    return true;
  },
  parsedData
);

createOutputFile(withoutInvalidUuids);