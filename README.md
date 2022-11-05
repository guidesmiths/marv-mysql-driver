[![NPM version](https://img.shields.io/npm/v/marv-mysql-driver.svg?style=flat-square)](https://www.npmjs.com/package/marv-mysql-driver)
[![NPM downloads](https://img.shields.io/npm/dm/marv-mysql-driver.svg?style=flat-square)](https://www.npmjs.com/package/marv-mysql-driver)
[![Build Status](https://img.shields.io/travis/guidesmiths/marv-mysql-driver/master.svg)](https://travis-ci.org/guidesmiths/marv-mysql-driver)
[![Maintainability](https://api.codeclimate.com/v1/badges/621e711c2cd6077f5ad3/maintainability)](https://codeclimate.com/github/guidesmiths/marv-mysql-driver/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/621e711c2cd6077f5ad3/test_coverage)](https://codeclimate.com/github/guidesmiths/marv-mysql-driver/test_coverage)
[![Code Style](https://img.shields.io/badge/code%20style-imperative-brightgreen.svg)](https://github.com/guidesmiths/eslint-config-imperative)

# marv-mysql-driver

A mysql driver for [marv](https://www.npmjs.com/package/marv)

## Prerequisites

One of:

- [mysql](https://www.npmjs.com/package/mysql)
- [mysql2](https://www.npmjs.com/package/mysql2)

marv-mysql-driver will automatically use whichever library you have installed **but does not package either of these libraries**. Please read the [troubleshooting](#troubleshooting) notes if using [mysql](https://www.npmjs.com/package/mysql) with MySQL 8.0 (or above).

## Installation

```
npm i marv marv-mysql-driver
```

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
const marv = require("marv/api/callback"); // <-- Callback API
const driver = require("marv-mysql-driver");
const directory = path.resolve("migrations");
const connection = {
  // Properties are passed straight [mysql|mysql2].createConnection
  host: "mysql.example.com",
  multipleStatements: true, // See https://www.npmjs.com/package/mysql#multiple-statement-queries
};

marv.scan(directory, (err, migrations) => {
  if (err) throw err;
  // Connection properties are passed straight [mysql|mysql2].createConnection
  marv.migrate(migrations, driver({ connection }), (err) => {
    if (err) throw err;
    // Profit :)
  });
});
```

## Troubleshooting

```
Client does not support authentication protocol requested by server; consider upgrading MySQL client
```

MySQL v8 changed the [default authentication plugin](https://dev.mysql.com/doc/refman/8.0/en/pluggable-authentication.html) to `caching_sha2_password`, which, at time of writing is not supported by [mysql](https://github.com/mysqljs/mysql/issues/2001). Therefore MySQL v8 users either need to [change](https://dev.mysql.com/doc/refman/8.0/en/server-system-variables.html#sysvar_default_authentication_plugin) the default authentication plugin back to `mysql_native_password` or install [mysql2](https://www.npmjs.com/package/mysql2).

MySQL v5 users can use either [mysql](https://www.npmjs.com/package/mysql) or [mysql2](https://www.npmjs.com/package/mysql2).

## Testing

```bash
npm install
npm run mysql5
npm run mysql8
npm run mysql8-native-password
sleep 30
npm test
```
