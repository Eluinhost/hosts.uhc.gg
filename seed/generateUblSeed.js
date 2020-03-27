const { concat, filter, join, map, pipe } = require("ramda");
const fs = require('fs');
const { xml2js } = require('xml-js');
const moment = require("moment");

const old = xml2js(fs.readFileSync('./data/oldUbl.xml', { encoding: 'utf-8' }), { compact: true });
const current = xml2js(fs.readFileSync('./data/currentUbl.xml', { encoding: 'utf-8' }), { compact: true });

const parseDate = (dateString) => {
  if (!dateString || dateString === 'Never') {
    // if there wasn't a date at all lets just go with fallback
    return null
  }

  const parsed = moment.utc(
    dateString
      .replace('Apil', 'April')
      .replace('Fabruary', 'February')
      .replace('September 31', 'October 1')
      .replace('June 31', 'July 1')
      .replace('November 31', 'December 1')
      .replace(' ', ''), // fix spacing issues by removing them all
    'DMMMM,YYYY'
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
      created: parseDate(item['gsx:datebanned']._text) || moment.utc('1January2000', 'DMMMM,YYYY'),
      expires: parseDate(item['gsx:expirydate']._text),
      ign: item['gsx:ign']._text,
      uuid: parseUuid(item['gsx:uuid']._text),
      reason: item['gsx:reason']._text,
      link: item['gsx:case']._text
    };
  } catch (err) {
    console.log(`Failed to parse record ${JSON.stringify(item)}`) ;
    throw err;
  }
};

const parseOldItem = item => {
  try {
    return {
      created: parseDate(item['gsx:bandate']._text) || moment.utc('1January2000', 'DMMMM,YYYY'),
      expires: parseDate(item['gsx:expirydate']._text),
      ign: item['gsx:player']._text,
      uuid: parseUuid(item['gsx:uuid']._text),
      reason: item['gsx:reason']._text,
      link: item['gsx:_ckd7g'] ? item['gsx:_ckd7g']._text : 'Unknown'
    };
  } catch (err) {
    console.log(`Failed to parse record ${JSON.stringify(item)}`) ;
    // throw err;
  }
};

const generateStatement = item => `INSERT INTO ubl (ign, uuid, reason, created, expires, link, createdBy) VALUES (
    '${item.ign.replace(/'/g, '\'\'')}',
    '${item.uuid}',
    '${item.reason.replace(/'/g, '\'\'')}',
    '${item.created}',
    ${item.expires ? `'${item.expires}'` : 'NULL'},
    '${item.link.replace(/'/g, '\'\'')}',
    'ghowden'
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

const withoutInvalidUuids =
  pipe(
    filter(x => Boolean(x)),
    filter(
      item => {
        if (item.uuid === '00000000-0000-0000-0000-000000000000') {
          console.log(`Skipping entry due to invalid UUID: ${JSON.stringify(item)}`)
          return false;
        }
        return true;
      },
    )
)(parsedData);

createOutputFile(withoutInvalidUuids);