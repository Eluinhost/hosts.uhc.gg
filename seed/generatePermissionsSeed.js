const {join, pipe, map, cond, equals, always, T} = require('ramda');
const moment = require('moment');
const fs = require('fs');

const data = require('./data/permissions').feed.entry;

const parsePermission = cond([
  [equals('T'), always('trial host')],
  [equals('V'), always('host')],
  [equals('A'), always('hosting advisor')],
  [equals('M'), always('admin')],
  [T,           type => { throw `Unexpected type ${type}` }],
]);

const parseItem = item => ({
  username: item.username.__text,
  permission: parsePermission(item.type.__text),
});


const generateStatement = item =>
    `INSERT INTO permissions (username, type) VALUES ('${item.username}', '${item.permission}')`;

const createOutputFile = pipe(
  map(parseItem),
  map(generateStatement),
  statements => [
    'BEGIN TRANSACTION',
    'TRUNCATE TABLE permissions',
    ...statements,
    'COMMIT TRANSACTION'
  ],
  join(';\n'),
  data => fs.writeFileSync('output.sql', data, {encoding: 'utf-8'})
);

createOutputFile(data)
