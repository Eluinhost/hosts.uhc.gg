const { join, pipe, map } = require('ramda');
const moment = require('moment');
const fs = require('fs');

const rawData = require('./data.json');

const parseDate = dateString => {
    const parsed = moment.utc(
        dateString
            .replace('Apil', 'April')
            .replace('Fabruary', 'February')
            .replace('September 31', 'October 1')
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

const parseItem = item => {
    try {
        return {
            created: parseDate(item.gsx$datebanned.$t),
            expires: parseDate(item.gsx$expirydate.$t),
            ign: item.gsx$ign.$t,
            uuid: parseUuid(item.gsx$uuid.$t),
            reason: item.gsx$reason.$t,
            link: item.gsx$case.$t
        };
    } catch (err) {
        throw new Error(`Failed to parse record ${JSON.stringify(item)} : ${err}`);
    }
};

const generateStatement = item => `INSERT INTO ubl (ign, uuid, reason, created, expires, link) VALUES (
    '${item.ign.replace(/'/g, '\'\'')}',
    '${item.uuid}',
    '${item.reason.replace(/'/g, '\'\'')}',
    '${item.created}',
    '${item.expires}',
    '${item.link.replace(/'/g, '\'\'')}'
)`;

const convertData = pipe(
    map(parseItem),
    map(generateStatement),
    statements => ['BEGIN TRANSACTION', ...statements, 'COMMIT TRANSACTION'],
    join(';\n'),
    data => fs.writeFileSync('output.sql', data, { encoding: 'utf-8' })
);

convertData(rawData.feed.entry);
