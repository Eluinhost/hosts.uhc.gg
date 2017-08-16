Latest data as XML here: 

current: `https://spreadsheets.google.com/feeds/list/1VdyBZs4B-qoA8-IijPvbRUVBLfOuU9I5fV_PhuOWJao/od6/private/values`

old: `https://spreadsheets.google.com/feeds/list/1VdyBZs4B-qoA8-IijPvbRUVBLfOuU9I5fV_PhuOWJao/od5/private/values`

Files should be placed in `/data` as json (https://codebeautify.org/xmlviewer, load url won't work have to c/p): `current.json` and `old.json` respectively

Running `node .` will generate `output.sql` containing some (a lot) insert queries for the data