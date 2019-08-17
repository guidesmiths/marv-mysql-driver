[![NPM version](https://img.shields.io/npm/v/marv-mysql-driver.svg?style=flat-square)](https://www.npmjs.com/package/marv-mysql-driver)
[![NPM downloads](https://img.shields.io/npm/dm/marv-mysql-driver.svg?style=flat-square)](https://www.npmjs.com/package/marv-mysql-driver)
[![Build Status](https://img.shields.io/travis/guidesmiths/marv-mysql-driver/master.svg)](https://travis-ci.org/guidesmiths/marv-mysql-driver)
[![Maintainability](https://api.codeclimate.com/v1/badges/621e711c2cd6077f5ad3/maintainability)](https://codeclimate.com/github/guidesmiths/marv-mysql-driver/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/621e711c2cd6077f5ad3/test_coverage)](https://codeclimate.com/github/guidesmiths/marv-mysql-driver/test_coverage)
[![Code Style](https://img.shields.io/badge/code%20style-imperative-brightgreen.svg)](https://github.com/guidesmiths/eslint-config-imperative)
[![Dependency Status](https://david-dm.org/guidesmiths/marv-mysql-driver.svg)](https://david-dm.org/guidesmiths/marv-mysql-driver)
[![devDependencies Status](https://david-dm.org/guidesmiths/marv-mysql-driver/dev-status.svg)](https://david-dm.org/guidesmiths/marv-mysql-driver?type=dev)

# marv-mysql-driver
A mysql driver for [marv](https://www.npmjs.com/package/marv)

## Usage
```
migrations/
  |- 001.create-table.sql
  |- 002.create-another-table.sql
```

### Promises
```js
const marv = require('marv/api/promise'); // <-- Promise API
const driver = require('marv-mysql-driver');
const directory = path.resolve('migrations');
const connection = {
  // Properties are passed straight mysql.createConnection
  host: 'mysql.example.com',
  multipleStatements: true    // See https://www.npmjs.com/package/mysql#multiple-statement-queries
};

const migrations = await marv.scan(directory);
await marv.migrate(migrations, driver({ connection });
// Profit :)
```

### Callbacks
```js
const marv = require('marv/api/callback'); // <-- Callback API
const driver = require('marv-mysql-driver');
const directory = path.resolve('migrations');
const connection = {
  // Properties are passed straight mysql.createConnection
  host: 'mysql.example.com',
  multipleStatements: true    // See https://www.npmjs.com/package/mysql#multiple-statement-queries
};

marv.scan(directory, (err, migrations) => {
  if (err) throw err
  // Connection properties are passed straight mysql.createConnection
  marv.migrate(migrations, driver({ connection }), (err) => {
    if (err) throw err
    // Profit :)
  })
})
```

## Testing
```bash
npm install
npm run docker
npm test
```
